<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diaries', function (Blueprint $table): void {
            // Endereço (caminho no storage) de até 2 arquivos anexados ao diário.
            $table->string('file_1')->nullable()->after('datetime');
            $table->string('file_2')->nullable()->after('file_1');
        });
    }

    public function down(): void
    {
        Schema::table('diaries', function (Blueprint $table): void {
            $table->dropColumn(['file_1', 'file_2']);
        });
    }
};
