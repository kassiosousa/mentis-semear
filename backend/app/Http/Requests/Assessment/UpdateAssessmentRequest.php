<?php

declare(strict_types=1);

namespace App\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'score' => ['sometimes', 'required', 'integer', 'between:0,10'],
            'suggestions' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }
}
