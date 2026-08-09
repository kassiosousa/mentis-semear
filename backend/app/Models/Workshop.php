<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Str;
use RuntimeException;

class Workshop extends Model
{
    use HasFactory;

    /** Máximo de tentativas de gerar um token único antes de abortar a criação. */
    public const TOKEN_MAX_ATTEMPTS = 5;

    /** @var list<string> */
    protected $fillable = [
        'company_id',
        'user_creator_id',
        'user_facilitator_id',
        'datetime',
        'address',
        'checkin_link',
        'assessment_link',
    ];

    protected static function booted(): void
    {
        // Token público gerado automaticamente e nunca alterável via API (fora do fillable).
        // Fallback para criações fora da API (seeders, testes, tinker); a rota de criação
        // usa createWithUniqueToken(), que ainda trata colisão de unicidade.
        static::creating(function (Workshop $workshop): void {
            $workshop->token ??= Str::random(11);
        });
    }

    /**
     * Cria um workshop garantindo a unicidade do token.
     *
     * O token é aleatório e a coluna é UNIQUE; uma colisão é improvável, porém
     * possível. Se o INSERT violar a unicidade do token, gera outro e tenta de
     * novo — até TOKEN_MAX_ATTEMPTS vezes. Esgotadas as tentativas, aborta a
     * criação inteira lançando RuntimeException (nenhum workshop é persistido).
     *
     * @param  array<string, mixed>  $attributes  Atributos preenchíveis (o token é ignorado se vier aqui).
     *
     * @throws RuntimeException  Se não obtiver um token único após as tentativas.
     */
    public static function createWithUniqueToken(array $attributes): self
    {
        for ($attempt = 1; $attempt <= self::TOKEN_MAX_ATTEMPTS; $attempt++) {
            $workshop = new self($attributes);
            $workshop->token = Str::random(11);

            try {
                $workshop->save();

                return $workshop;
            } catch (UniqueConstraintViolationException $e) {
                // Só reprocessa se a colisão for do token; outra constraint deve propagar.
                if (! str_contains($e->getMessage(), 'token')) {
                    throw $e;
                }
                // Colisão de token — gera outro na próxima iteração.
            }
        }

        throw new RuntimeException(
            'Não foi possível gerar um token único para o workshop após '.self::TOKEN_MAX_ATTEMPTS.' tentativas.'
        );
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['datetime' => 'datetime'];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_creator_id');
    }

    public function facilitator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_facilitator_id');
    }

    public function checkIns(): HasMany
    {
        return $this->hasMany(CheckIn::class);
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }

    /** A workshop has a single diary (1:1). */
    public function diary(): HasOne
    {
        return $this->hasOne(Diary::class);
    }
}
