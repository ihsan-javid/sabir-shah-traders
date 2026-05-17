"use client";

/**
 * Single client entry for admin image uploads → `/api/admin/upload/image`.
 * No FileReader, no blob URLs; response is Cloudinary HTTPS URLs only.
 *
 * @param {File} file
 * @param {{ folder?: string; onProgress?: (ratio: number) => void; signal?: AbortSignal }} [options]
 * @returns {Promise<{ url: string; publicId: string }>}
 */
export function uploadImageViaAdminApi(file, options = {}) {
  const { folder = "products", onProgress, signal } = options;

  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload/image");
    xhr.withCredentials = true;

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && typeof onProgress === "function") {
        onProgress(ev.loaded / ev.total);
      }
    };

    const onAbort = () => {
      xhr.abort();
      reject(new Error("Aborted"));
    };
    if (signal) {
      if (signal.aborted) {
        reject(new Error("Aborted"));
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }

    xhr.onload = () => {
      if (signal) signal.removeEventListener("abort", onAbort);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const j = JSON.parse(xhr.responseText);
          if (j.url) resolve({ url: j.url, publicId: j.publicId || "" });
          else reject(new Error(j.error || "Upload failed"));
        } catch (e) {
          reject(e);
        }
      } else {
        try {
          const j = JSON.parse(xhr.responseText);
          reject(new Error(j.error || xhr.statusText));
        } catch {
          reject(new Error(xhr.statusText));
        }
      }
    };

    xhr.onerror = () => {
      if (signal) signal.removeEventListener("abort", onAbort);
      reject(new Error("Network error"));
    };

    xhr.send(fd);
  });
}

/**
 * Upload many files sequentially; onProgress receives overall 0..1.
 */
export async function uploadImagesViaAdminApiSequential(files, options = {}) {
  const list = Array.from(files || []);
  const { folder = "products", onProgress } = options;
  const out = [];
  let done = 0;
  for (const file of list) {
    const r = await uploadImageViaAdminApi(file, {
      folder,
      onProgress: (p) => {
        if (typeof onProgress === "function") {
          onProgress((done + p) / list.length);
        }
      },
      signal: options.signal,
    });
    out.push(r);
    done += 1;
    if (typeof onProgress === "function") onProgress(done / list.length);
  }
  return out;
}
