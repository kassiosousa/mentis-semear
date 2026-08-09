<?php

declare(strict_types=1);

namespace App\Http\Requests\Workshop;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateWorkshopRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        // checkin_link/assessment_link não são editáveis — derivam do token (imutável).
        return [
            'company_id' => ['sometimes', 'required', 'integer', 'exists:companies,id'],
            'user_facilitator_id' => ['sometimes', 'nullable', 'string', 'exists:users,id'],
            'datetime' => ['sometimes', 'required', 'date'],
            'address' => ['sometimes', 'required', 'string', 'max:255'],
        ];
    }
}
