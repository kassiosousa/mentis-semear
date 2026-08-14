<?php

declare(strict_types=1);

namespace App\Http\Requests\MoodEntry;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreMoodEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            // Setor obrigatório e precisa pertencer à empresa informada.
            'sector_id' => [
                'required', 'integer',
                Rule::exists('sectors', 'id')->where(fn ($q) => $q->where('company_id', $this->input('company_id'))),
            ],
            'mood' => ['required', 'integer', 'between:1,5'],
        ];
    }
}
