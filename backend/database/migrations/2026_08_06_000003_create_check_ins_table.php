<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_ins', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('workshop_id')->constrained('workshops')->cascadeOnDelete();
            $table->string('name');
            $table->string('position');
            $table->string('sector');
            $table->boolean('lgpd_read')->default(false);
            $table->dateTime('lgpd_consent_at')->nullable();
            $table->char('cpf', 11);
            $table->date('birthday');
            $table->string('gender', 30);
            $table->string('celphone', 20);
            $table->string('email')->nullable();
            $table->timestamps();

            // Um participante (CPF) só faz check-in uma vez por workshop.
            $table->unique(['workshop_id', 'cpf']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_ins');
    }
};
