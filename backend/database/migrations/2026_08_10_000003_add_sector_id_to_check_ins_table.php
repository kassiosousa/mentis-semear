<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('check_ins', function (Blueprint $table): void {
            // Setor gerenciado da empresa — opcional (null = "Sem setor definido").
            // Ao remover o setor, o check-in é preservado com sector_id anulado.
            $table->foreignId('sector_id')->nullable()->after('position')->constrained('sectors')->nullOnDelete();
        });

        // Mantém o texto livre `sector` (retrocompatível), agora opcional.
        Schema::table('check_ins', function (Blueprint $table): void {
            $table->string('sector')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('check_ins', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('sector_id');
        });

        Schema::table('check_ins', function (Blueprint $table): void {
            $table->string('sector')->nullable(false)->change();
        });
    }
};
