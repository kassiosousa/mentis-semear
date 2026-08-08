<?php

declare(strict_types=1);

namespace App\Http\Requests\Workshop;

use Illuminate\Foundation\Http\FormRequest;

final class StoreWorkshopRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        // user_creator_id não é aceito aqui — é definido como o usuário autenticado.
        return [
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'user_facilitator_id' => ['nullable', 'string', 'exists:users,id'],
            'datetime' => ['required', 'date'],
            'address' => ['required', 'string', 'max:255'],
            'checkin_link' => ['required', 'string', 'max:255'],
            'assessment_link' => ['required', 'string', 'max:255'],
        ];
    }
}
