<?php

declare(strict_types=1);

namespace App\Http\Requests\CheckIn;

use App\Models\Workshop;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreCheckInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'workshop_id' => ['required', 'integer', 'exists:workshops,id'],
            'name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            // Texto livre legado (opcional, mantido para retrocompatibilidade do front atual).
            'sector' => ['nullable', 'string', 'max:255'],
            // Setor gerenciado — opcional; se informado, precisa pertencer à empresa do workshop.
            'sector_id' => [
                'nullable', 'integer',
                Rule::exists('sectors', 'id')->where(fn ($q) => $q->where('company_id', $this->workshopCompanyId())),
            ],
            'lgpd_read' => ['required', 'boolean'],
            'cpf' => [
                'required', 'digits:11',
                // Um CPF só faz check-in uma vez por workshop.
                Rule::unique('check_ins', 'cpf')->where('workshop_id', $this->input('workshop_id')),
            ],
            'birthday' => ['required', 'date'],
            'gender' => ['required', 'string', 'max:30'],
            'celphone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
        ];
    }

    /** Empresa dona do workshop informado (para validar o setor). */
    private function workshopCompanyId(): ?int
    {
        return Workshop::whereKey($this->input('workshop_id'))->value('company_id');
    }
}
