
alert('✅ k3.js dimuat!');

(function() {
    const supabase = window.supabase;
    if (!supabase) {
        alert('❌ supabase tidak terdefinisi!');
        return;
    }

    // Test koneksi ke tabel k3_reports
    async function testK3() {
        try {
            const { data, error } = await supabase
                .from('k3_reports')
                .select('count', { count: 'exact', head: true });
            
            if (error) {
                alert('❌ Error: ' + error.message);
                console.error(error);
            } else {
                alert('✅ Tabel k3_reports bisa diakses!');
            }
        } catch (err) {
            alert('❌ Exception: ' + err.message);
        }
    }

    testK3();
})();