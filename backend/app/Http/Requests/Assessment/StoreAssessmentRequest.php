<?php

declare(strict_types=1);

namespace App\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

final class StoreAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        // Avaliação anônima — sem vínculo com participante.
        return [
            'workshop_id' => ['required', 'integer', 'exists:workshops,id'],
            'score' => ['required', 'integer', 'between:0,10'],
            'suggestions' => ['nullable', 'string', 'max:500'],
        ];
    }
}
