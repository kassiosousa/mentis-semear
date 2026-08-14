<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckIn extends Model
{
    use HasFactory;

    protected $table = 'check_ins';

    /** @var list<string> */
    protected $fillable = [
        'workshop_id',
        'name',
        'position',
        'sector',      // texto livre legado (opcional, retrocompatível)
        'sector_id',   // setor gerenciado da empresa (opcional)
        'lgpd_read',
        'lgpd_consent_at',
        'cpf',
        'birthday',
        'gender',
        'celphone',
        'email',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'lgpd_read' => 'boolean',
            'lgpd_consent_at' => 'datetime',
            'birthday' => 'date',
        ];
    }

    public function workshop(): BelongsTo
    {
        return $this->belongsTo(Workshop::class);
    }

    /**
     * Setor gerenciado da empresa (opcional).
     * Nome `managedSector` para não colidir com a coluna legada `sector` (texto).
     */
    public function managedSector(): BelongsTo
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }
}
