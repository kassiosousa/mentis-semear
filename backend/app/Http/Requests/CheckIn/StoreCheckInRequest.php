<?php

declare(strict_types=1);

namespace App\Http\Requests\CheckIn;

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
            'sector' => ['required', 'string', 'max:255'],
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
}
