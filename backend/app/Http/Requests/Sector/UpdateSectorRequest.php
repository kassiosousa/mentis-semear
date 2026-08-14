<?php

declare(strict_types=1);

namespace App\Http\Requests\Sector;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateSectorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        // A empresa do setor é imutável — só o nome pode mudar.
        $sector = $this->route('sector');

        return [
            'name' => [
                'sometimes', 'required', 'string', 'max:255',
                Rule::unique('sectors', 'name')
                    ->where('company_id', $sector?->company_id)
                    ->ignore($sector?->id),
            ],
        ];
    }
}
