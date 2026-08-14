<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Token público da empresa — usado no link do termômetro emocional.
        Schema::table('companies', function (Blueprint $table): void {
            $table->string('token', 16)->nullable()->after('id');
        });

        // Backfill das empresas existentes antes de exigir unicidade.
        foreach (DB::table('companies')->whereNull('token')->pluck('id') as $id) {
            DB::table('companies')->where('id', $id)->update(['token' => Str::random(11)]);
        }

        Schema::table('companies', function (Blueprint $table): void {
            $table->unique('token');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table): void {
            $table->dropUnique(['token']);
            $table->dropColumn('token');
        });
    }
};
