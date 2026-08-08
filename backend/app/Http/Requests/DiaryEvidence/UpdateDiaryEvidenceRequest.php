<?php

declare(strict_types=1);

namespace App\Http\Requests\DiaryEvidence;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateDiaryEvidenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        // diary_id é imutável.
        return [
            'link' => ['sometimes', 'required', 'string', 'url', 'max:2048'],
        ];
    }
}
