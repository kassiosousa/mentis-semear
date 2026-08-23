<?php

declare(strict_types=1);

namespace App\Http\Requests\CheckIn;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateCheckInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $checkIn = $this->route('checkIn');
        $companyId = $checkIn?->workshop?->company_id;

        // workshop_id é imutável (o check-in pertence ao workshop onde foi feito).
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'position' => ['sometimes', 'required', 'string', 'max:255'],
            'sector' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sector_id' => [
                'sometimes', 'nullable', 'integer',
                Rule::exists('sectors', 'id')->where(fn ($q) => $q->where('company_id', $companyId)),
            ],
            'lgpd_read' => ['sometimes', 'required', 'boolean'],
            'cpf' => [
                'sometimes', 'required', 'digits:11',
                Rule::unique('check_ins', 'cpf')
                    ->where('workshop_id', $checkIn?->workshop_id)
                    ->ignore($checkIn),
            ],
            'birthday' => ['sometimes', 'required', 'date'],
            'gender' => ['sometimes', 'required', 'string', 'max:30'],
            'celphone' => ['sometimes', 'required', 'string', 'max:20'],
            'email' => ['sometimes', 'nullable', 'string', 'email', 'max:255'],
        ];
    }
}
