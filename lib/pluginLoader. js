// lib/pluginLoader.js
export async function loadAllManifests() {
  // Gunakan import.meta.glob untuk membaca semua manifest.json di modules/
  const modules = import.meta.glob('../modules/*/manifest.json');
  const manifests = [];
  for (const path in modules) {
    try {
      const mod = await modules[path]();
      manifests.push(mod);
    } catch (err) {
      console.error(`Gagal load manifest ${path}:`, err);
    }
  }
  return manifests;
}

export function getAccessibleModules(manifests, allowedList) {
  return manifests.filter(m => 
    m.access.some(role => allowedList.includes(role) || allowedList.includes('admin'))
  );
}
