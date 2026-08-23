<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Str;
use RuntimeException;
use App\Enums\UserType;

class Company extends Model
{
    use HasFactory;

    /** Máximo de tentativas de gerar um token único antes de abortar a criação. */
    public const TOKEN_MAX_ATTEMPTS = 5;

    /** @var list<string> */
    protected $fillable = ['name', 'address', 'email'];

    /** thermometer_link é derivado do token — sempre presente no JSON. */
    protected $appends = ['thermometer_link'];

    protected static function booted(): void
    {
        // Token público gerado automaticamente (fallback para seeders/testes/tinker).
        static::creating(function (Company $company): void {
            $company->token ??= Str::random(11);
        });

        // Notifica os admins ao cadastrar uma empresa.
        static::created(function (Company $company): void {
            Notification::forType(UserType::Admin, 'Nova empresa', "Empresa {$company->name} cadastrada.", 'company.created');
        });
    }

    /** Link público do termômetro emocional (aponta para o frontend). */
    public function getThermometerLinkAttribute(): string
    {
        return rtrim((string) config('app.frontend_url'), '/').'/termometro/'.$this->token;
    }

    /**
     * Cria uma empresa garantindo a unicidade do token (até TOKEN_MAX_ATTEMPTS tentativas).
     *
     * @param  array<string, mixed>  $attributes
     *
     * @throws RuntimeException
     */
    public static function createWithUniqueToken(array $attributes): self
    {
        for ($attempt = 1; $attempt <= self::TOKEN_MAX_ATTEMPTS; $attempt++) {
            try {
                return self::create($attributes);
            } catch (UniqueConstraintViolationException $e) {
                if (! str_contains($e->getMessage(), 'token')) {
                    throw $e;
                }
                // Colisão de token — nova tentativa gera outro.
            }
        }

        throw new RuntimeException(
            'Não foi possível gerar um token único para a empresa após '.self::TOKEN_MAX_ATTEMPTS.' tentativas.'
        );
    }

    /** Workshops hosted by this company. */
    public function workshops(): HasMany
    {
        return $this->hasMany(Workshop::class);
    }

    /** Sectors (departments) managed by this company. */
    public function sectors(): HasMany
    {
        return $this->hasMany(Sector::class);
    }

    /** Registros do termômetro emocional desta empresa. */
    public function moodEntries(): HasMany
    {
        return $this->hasMany(MoodEntry::class);
    }
}
