<?php

declare(strict_types=1);

namespace App\Http\Requests\Sector;

use App\Enums\UserType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreSectorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Para o usuário "empresa" o company_id é irrelevante (usa sempre a própria):
        // removê-lo do input evita validá-lo (ex.: 'exists') e ele é sempre ignorado.
        if ($this->user()?->type === UserType::Empresa) {
            $this->replace($this->except('company_id'));
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $companyId = $this->resolvedCompanyId();

        return [
            // Admin informa a empresa; o usuário "empresa" usa a própria (input ignorado).
            'company_id' => [
                Rule::requiredIf(fn (): bool => $this->user()?->type === UserType::Admin),
                'integer',
                'exists:companies,id',
            ],
            'name' => [
                'required', 'string', 'max:255',
                // Nome único dentro da empresa.
                Rule::unique('sectors', 'name')->where('company_id', $companyId),
            ],
        ];
    }

    /** Empresa efetiva do setor: a do próprio usuário (tipo empresa) ou a informada (admin). */
    public function resolvedCompanyId(): ?int
    {
        $user = $this->user();

        if ($user?->type === UserType::Empresa) {
            return $user->company_id;
        }

        return $this->integer('company_id') ?: null;
    }
}
