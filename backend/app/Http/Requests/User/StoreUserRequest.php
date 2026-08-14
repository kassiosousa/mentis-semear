<?php

declare(strict_types=1);

namespace App\Http\Requests\User;

use App\Enums\UserType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

final class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'type' => ['required', new Enum(UserType::class)],
            // Vínculo obrigatório com uma empresa existente quando o tipo é "empresa".
            'company_id' => [
                Rule::requiredIf(fn (): bool => $this->input('type') === UserType::Empresa->value),
                'nullable', 'integer', 'exists:companies,id',
            ],
        ];
    }
}
