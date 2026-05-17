"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Folder,
  Search,
  Grid3X3,
  List,
  Image,
  Trash2,
  Copy,
  X,
  Check,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Eye,
  Plus,
  Move,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import {
  productImageUrlThumb,
  productImageUrlHero,
} from "@/lib/cloudinaryUrls";
import {
  AdminButton,
  AdminCard,
  AdminLabel,
  AdminPageHeader,
  AdminSpinner,
  AdminEmpty,
  AdminInput,
} from "@/components/admin/AdminShared";

function formatBytes(n) {
  if (!n || n < 1024) return `${n || 0} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function ImagePreview({ src, alt }) {
  const [broken, setBroken] = useState(false);
  const thumb = productImageUrlThumb(src);
  if (broken || !src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted/60">
        <Image className="h-10 w-10 text-muted-foreground/30" />
      </div>
    );
  }
  return (
    <img
      src={thumb}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setBroken(true)}
    />
  );
}

export default function MediaPage() {
  const router = useRouter();

  const redirectToLogin = useCallback(() => {
    router.push("/admin-login");
  }, [router]);

  // ── State ─────────────────────────────────────────────────────────────────
  // authReady is set to true only after check-auth confirms the session.
  // This prevents fetchLibrary from firing with a stale/expired access token
  // before check-auth has had a chance to refresh it.
  const [authReady, setAuthReady] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState([]);
  const [folder, setFolder] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  // Folder Creation Modal states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Expandable folder section states
  const [expandedFolders, setExpandedFolders] = useState({});
  const fileRef = useRef(null);

  // Move/Copy Modal states
  const [moveModal, setMoveModal] = useState(null); // { type: 'move' | 'copy', targetImage, destinationFolder }
  const [selectedDestFolder, setSelectedDestFolder] = useState("");

  // Drag-drop states
  const [draggedImage, setDraggedImage] = useState(null);
  const [dragOverFolder, setDragOverFolder] = useState(null);

  // ── Auth check ────────────────────────────────────────────────────────────
  // MUST complete before fetchLibrary runs (see authReady above).
  useEffect(() => {
    fetch("/api/admin/check-auth", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) {
          redirectToLogin();
        } else {
          setAuthReady(true);
        }
      })
      .catch(() => redirectToLogin());
  }, [redirectToLogin]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const qs = folder !== "All" ? `?folder=${encodeURIComponent(folder)}` : "";
      const res = await fetch(`/api/admin/media${qs}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        redirectToLogin();
        return;
      }
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}: Failed to load media library`);

      setImages(Array.isArray(data.items) ? data.items : []);
      if (Array.isArray(data.folders)) {
        setFolders(data.folders);
      }
    } catch (e) {
      toast.error(e.message || "Failed to load library");
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [folder, redirectToLogin]);

  // Only fetch after auth is confirmed (see authReady above)
  useEffect(() => {
    if (!authReady) return;
    fetchLibrary();
  }, [fetchLibrary, authReady]);

  // Group images by folder for expandable sections
  const filtered = images.filter((img) => {
    const name = (img.name || "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const grouped = {};
  filtered.forEach((img) => {
    const f = img.folder || "Root";
    if (!grouped[f]) grouped[f] = [];
    grouped[f].push(img);
  });

  // Default newly discovered folders to expanded
  useEffect(() => {
    if (images.length > 0) {
      const initial = {};
      images.forEach((img) => {
        const f = img.folder || "Root";
        initial[f] = true;
      });
      setExpandedFolders((prev) => ({ ...initial, ...prev }));
    }
  }, [images]);

  const toggleFolder = (folderName) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const handleDelete = (img) => {
    setConfirmDelete(img);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(
        `/api/admin/media?id=${encodeURIComponent(confirmDelete.publicId)}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) { redirectToLogin(); return; }
      if (!res.ok) throw new Error(data.error || "Delete failed");
      
      toast.success("Deleted from Cloudinary successfully");
      fetchLibrary(); // Auto refresh
    } catch (e) {
      toast.error(e.message || "Delete failed");
    } finally {
      setConfirmDelete(null);
    }
  };

  const executeBulkDelete = async () => {
    try {
      const idsParam = selected.join(",");
      const res = await fetch(
        `/api/admin/media?ids=${encodeURIComponent(idsParam)}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) { redirectToLogin(); return; }
      if (!res.ok) throw new Error(data.error || "Bulk delete failed");
      
      setSelected([]);
      toast.success(`${selected.length} items deleted successfully from Cloudinary`);
      fetchLibrary(); // Auto refresh
    } catch (err) {
      toast.error(err.message || "Bulk delete failed");
    } finally {
      setBulkConfirm(false);
    }
  };

  const selectAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map(i => i.publicId));
  };

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setUploading(true);
    setUploadPct(0);
    const uploadFolder = folder !== "All" ? folder : "sabir-shah-ecom/media";
    let done = 0;

    try {
      for (const file of files) {
        const base64Data = await fileToBase64(file);
        
        const res = await fetch("/api/admin/media", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "upload",
            file: base64Data,
            folder: uploadFolder,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 403) { redirectToLogin(); return; }
        if (!res.ok) throw new Error(data.error || "Upload failed");

        done += 1;
        setUploadPct(done / files.length);
      }
      toast.success(`${files.length} file(s) uploaded to Cloudinary successfully!`);
      fetchLibrary(); // Auto refresh
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadPct(null);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_folder",
          folder: `sabir-shah-ecom/${newFolderName.trim().toLowerCase()}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to create folder");
      
      toast.success("Folder created successfully!");
      setNewFolderName("");
      setCreateFolderOpen(false);
      fetchLibrary(); // Auto refresh
    } catch (err) {
      toast.error(err.message || "Failed to create folder");
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    uploadFiles(files);
    e.target.value = "";
  };

  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied!");
  };

  const executeMoveOrCopy = async () => {
    if (!moveModal || !selectedDestFolder || !moveModal.targetImage) return;
    
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: moveModal.type, // 'move' or 'copy'
          publicId: moveModal.targetImage.publicId,
          url: moveModal.targetImage.url,
          destFolder: selectedDestFolder,
        }),
      });
      
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `${moveModal.type} failed`);
      
      const actionText = moveModal.type === 'move' ? 'moved' : 'copied';
      toast.success(`Image ${actionText} successfully!`);
      setMoveModal(null);
      setSelectedDestFolder("");
      fetchLibrary();
    } catch (err) {
      toast.error(err.message || `${moveModal.type} failed`);
    }
  };

  // Drag-drop handlers
  const handleImageDragStart = (e, image) => {
    setDraggedImage(image);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleImageDragEnd = () => {
    setDraggedImage(null);
    setDragOverFolder(null);
  };

  const handleFolderDragOver = (e, folder) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedImage && draggedImage.folder !== folder) {
      setDragOverFolder(folder);
    }
  };

  const handleFolderDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleFolderDrop = async (e, folder) => {
    e.preventDefault();
    setDragOverFolder(null);
    
    if (!draggedImage || draggedImage.folder === folder) {
      setDraggedImage(null);
      return;
    }

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "move",
          publicId: draggedImage.publicId,
          destFolder: folder,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Move failed");

      toast.success("Image moved successfully!");
      setDraggedImage(null);
      fetchLibrary();
    } catch (err) {
      toast.error(err.message || "Move failed");
      setDraggedImage(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <AdminPageHeader
        title="Media Library"
        description={`${images.length} assets retrieved directly from Cloudinary storage`}
        actions={
          <div className="flex items-center gap-3">
            <AdminButton
              type="button"
              variant="outline"
              icon={FolderPlus}
              onClick={() => setCreateFolderOpen(true)}
            >
              New Folder
            </AdminButton>
            <AdminButton
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              icon={Upload}
            >
              {uploading ? "Uploading…" : "Upload Files"}
            </AdminButton>
          </div>
        }
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        disabled={uploading}
        onChange={handleFileInput}
        className="hidden"
      />

      {uploading && uploadPct != null && (
        <div className="h-1.5 w-full max-w-md rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-150"
            style={{ width: `${Math.round(uploadPct * 100)}%` }}
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 shadow-sm overflow-x-auto max-w-full">
          <button
            type="button"
            disabled={uploading}
            onClick={() => setFolder("All")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              folder === "All"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            All folders
          </button>
          {folders.filter(f => f !== "All").map((f) => (
            <button
              key={f}
              type="button"
              disabled={uploading}
              onClick={() => setFolder(f)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                folder === f
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Folder className="h-3.5 w-3.5" />
              {f.replace("sabir-shah-ecom/", "")}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-sm group">
          <AdminInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search images..."
            icon={Search}
          />
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg ${
              viewMode === "grid"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {selected.length > 0 && (
          <AdminButton
            type="button"
            variant="danger"
            onClick={() => setBulkConfirm(true)}
            icon={Trash2}
          >
            Delete Selected ({selected.length})
          </AdminButton>
        )}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileRef.current?.click();
          }
        }}
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!uploading) uploadFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed border-border rounded-2xl p-8 text-center transition-colors bg-card ${
          uploading
            ? "opacity-60 cursor-wait animate-pulse"
            : "hover:border-primary/50 hover:bg-primary/[0.02] cursor-pointer"
        }`}
      >
        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-bold text-foreground">
          Drag & drop images here, or{" "}
          <span className="text-primary font-black">click to browse</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          JPEG, PNG, WebP, GIF uploaded securely to Cloudinary (up to ~12MB)
        </p>
      </div>

      {/* Loading state */}
      {loading ? (
        <AdminCard>
          <AdminSpinner />
        </AdminCard>
      ) : Object.keys(grouped).length === 0 ? (
        <AdminCard>
          <AdminEmpty
            title="No media assets found"
            description="Upload some files or change your filter selection to begin."
          />
        </AdminCard>
      ) : (
        /* Render Expandable Folder Sections */
        <div className="space-y-6">
          {Object.entries(grouped).map(([folderName, itemsList]) => {
            const isExpanded = expandedFolders[folderName] !== false;
            const displayName = folderName.replace("sabir-shah-ecom/", "");
            
            return (
              <div key={folderName} className="space-y-3">
                {/* Folder Header Row */}
                <button
                  type="button"
                  onClick={() => toggleFolder(folderName)}
                  onDragOver={(e) => handleFolderDragOver(e, folderName)}
                  onDragLeave={handleFolderDragLeave}
                  onDrop={(e) => handleFolderDrop(e, folderName)}
                  className={`w-full flex items-center justify-between px-6 py-4 bg-card border border-border rounded-2xl shadow-sm transition-all text-left ${
                    dragOverFolder === folderName ? "border-primary bg-primary/5 shadow-md" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Folder className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-foreground">
                        {displayName === "Root" ? "Root Media Directory" : displayName}
                      </span>
                      <span className="ml-2 text-[10px] font-bold text-muted-foreground uppercase bg-muted/60 px-2 py-0.5 rounded">
                        {itemsList.length} image{itemsList.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {/* Expanded Grid/List of images */}
                {isExpanded && (
                  <div className="pl-2 pr-2 transition-all">
                    {viewMode === "grid" ? (
                      /* Grid View inside Folder */
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {itemsList.map((img) => (
                          <div
                            key={img.publicId}
                            draggable={!uploading}
                            onDragStart={(e) => handleImageDragStart(e, img)}
                            onDragEnd={handleImageDragEnd}
                            className={`bg-card rounded-2xl border overflow-hidden shadow-sm group cursor-pointer transition-all ${
                              selected.includes(img.publicId)
                                ? "border-primary ring-4 ring-primary/10 scale-[1.02]"
                                : "border-border hover:border-primary/30 hover:shadow-md"
                            } ${draggedImage?.publicId === img.publicId ? "opacity-50 scale-95" : ""}`}
                            onClick={() => toggleSelect(img.publicId)}
                          >
                            <div className="relative aspect-square bg-muted/50 flex items-center justify-center">
                              <ImagePreview src={img.url} alt={img.name} />
                              {selected.includes(img.publicId) && (
                                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                    <Check className="h-5 w-5 text-primary-foreground" />
                                  </div>
                                </div>
                              )}
                              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreview(img);
                                  }}
                                  className="p-2 bg-card rounded-xl shadow-xl border border-border text-foreground hover:text-primary hover:scale-110 transition-all"
                                  title="Preview">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMoveModal({ type: 'move', targetImage: img, destinationFolder: '' });
                                    setSelectedDestFolder('');
                                  }}
                                  className="p-2 bg-card rounded-xl shadow-xl border border-border text-foreground hover:text-primary hover:scale-110 transition-all"
                                  title="Move">
                                  <Move className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMoveModal({ type: 'copy', targetImage: img, destinationFolder: '' });
                                    setSelectedDestFolder('');
                                  }}
                                  className="p-2 bg-card rounded-xl shadow-xl border border-border text-foreground hover:text-primary hover:scale-110 transition-all"
                                  title="Copy">
                                  <Copy className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyUrl(img.url);
                                  }}
                                  className="p-2 bg-card rounded-xl shadow-xl border border-border text-foreground hover:text-primary hover:scale-110 transition-all"
                                  title="Copy URL">
                                  <Zap className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="px-4 py-3.5">
                              <div className="text-xs font-black text-foreground truncate uppercase tracking-tight">
                                {img.name}
                              </div>
                              <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 mt-0.5">
                                {formatBytes(img.sizeBytes)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* List View inside Folder */
                      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-muted/40 border-b border-border">
                            <tr>
                              <th className="px-5 py-3 w-10">
                                <input
                                  type="checkbox"
                                  checked={itemsList.length > 0 && itemsList.every(i => selected.includes(i.publicId))}
                                  onChange={() => {
                                    const allPids = itemsList.map(i => i.publicId);
                                    const hasAll = allPids.every(pid => selected.includes(pid));
                                    if (hasAll) {
                                      setSelected(prev => prev.filter(pid => !allPids.includes(pid)));
                                    } else {
                                      setSelected(prev => Array.from(new Set([...prev, ...allPids])));
                                    }
                                  }}
                                  className="rounded border-border text-primary focus:ring-primary/20"
                                />
                              </th>
                              <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                File details
                              </th>
                              <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                Size
                              </th>
                              <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                Uploaded date
                              </th>
                              <th className="px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {itemsList.map((img) => (
                              <tr key={img.publicId} draggable={!uploading} onDragStart={(e) => handleImageDragStart(e, img)} onDragEnd={handleImageDragEnd} className={`hover:bg-muted/10 transition-all ${draggedImage?.publicId === img.publicId ? "opacity-50" : ""}`}>
                                <td className="px-5 py-3">
                                  <input
                                    type="checkbox"
                                    checked={selected.includes(img.publicId)}
                                    onChange={() => toggleSelect(img.publicId)}
                                    className="rounded border-border text-primary focus:ring-primary/20"
                                  />
                                </td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                                      <img
                                        src={productImageUrlThumb(img.url)}
                                        alt=""
                                        className="h-full w-full object-cover animate-in fade-in"
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <div className="font-bold text-foreground text-xs uppercase tracking-tight">
                                        {img.name}
                                      </div>
                                      <div className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">
                                        {img.mimeType}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">
                                  {formatBytes(img.sizeBytes)}
                                </td>
                                <td className="px-5 py-3 text-xs text-muted-foreground/60 font-semibold uppercase">
                                  {img.createdAt
                                    ? new Date(img.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "2-digit",
                                        year: "numeric",
                                      })
                                    : "—"}
                                </td>
                                <td className="px-5 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => copyUrl(img.url)}
                                      className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(img)}
                                      className="p-2 rounded-xl hover:bg-red-50 text-red-500 hover:scale-110 transition-all border border-transparent hover:border-red-100"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cloudinary Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setPreview(null)}
          />
          <div className="relative bg-card rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-border/50">
            <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-muted/30">
              <div>
                <div className="font-black text-foreground uppercase tracking-widest text-sm">{preview.name}</div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-60">
                  {preview.folder} · {formatBytes(preview.sizeBytes)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="p-2.5 rounded-2xl hover:bg-muted transition-all"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="bg-muted/10 flex items-center justify-center p-8 min-h-[400px]">
              <img
                src={productImageUrlHero(preview.url)}
                alt={preview.name}
                className="max-h-[50vh] max-w-full rounded-2xl object-contain shadow-2xl animate-in zoom-in-95"
              />
            </div>
            <div className="p-8 flex gap-4 bg-muted/5">
              <AdminButton
                type="button"
                onClick={() => {
                  copyUrl(preview.url);
                  setPreview(null);
                }}
                className="flex-1 py-4"
              >
                Copy Link
              </AdminButton>
              <AdminButton
                type="button"
                variant="danger"
                onClick={() => {
                  handleDelete(preview);
                  setPreview(null);
                }}
                className="px-6 py-4"
              >
                <Trash2 className="h-4 w-4" />
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Creation Modal */}
      {createFolderOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCreateFolderOpen(false)}
          />
          <div className="relative bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="font-black text-foreground uppercase tracking-widest text-xs">Create New Folder</div>
              <button
                type="button"
                onClick={() => setCreateFolderOpen(false)}
                className="p-1 rounded-lg hover:bg-muted transition-all"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleCreateFolder} className="p-6 space-y-4">
              <div>
                <AdminLabel required>Folder name (created under sabir-shah-ecom/)</AdminLabel>
                <AdminInput
                  required
                  placeholder="e.g. supplements, marketing"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <AdminButton
                  type="submit"
                  loading={creatingFolder}
                  className="flex-1 py-3"
                >
                  Create
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="outline"
                  onClick={() => setCreateFolderOpen(false)}
                  className="flex-1 py-3"
                >
                  Cancel
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deletions confirmation modal */}
      <ConfirmationModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Delete Cloudinary Asset"
        message={`Are you sure you want to permanently delete "${confirmDelete?.name}" from your Cloudinary account? This action is irreversible.`}
      />

      <ConfirmationModal
        isOpen={bulkConfirm}
        onClose={() => setBulkConfirm(false)}
        onConfirm={executeBulkDelete}
        title="Bulk Delete Cloudinary Assets"
        message={`Are you sure you want to permanently delete all ${selected.length} checked assets from Cloudinary? This action is irreversible.`}
      />

      {/* Move/Copy Modal */}
      {moveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setMoveModal(null);
              setSelectedDestFolder("");
            }}
          />
          <div className="relative bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="font-black text-foreground uppercase tracking-widest text-xs">
                {moveModal.type === 'move' ? 'Move Image' : 'Copy Image'}
              </div>
              <button
                type="button"
                onClick={() => {
                  setMoveModal(null);
                  setSelectedDestFolder("");
                }}
                className="p-1 rounded-lg hover:bg-muted transition-all"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <AdminLabel>Select Destination Folder</AdminLabel>
                <select
                  value={selectedDestFolder}
                  onChange={(e) => setSelectedDestFolder(e.target.value)}
                  className="w-full mt-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-primary outline-none"
                >
                  <option value="">Choose a folder...</option>
                  {folders.filter(f => f !== "All" && f !== moveModal.targetImage.folder).map((f) => (
                    <option key={f} value={f}>
                      {f.replace("sabir-shah-ecom/", "")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <AdminButton
                  type="button"
                  disabled={!selectedDestFolder}
                  onClick={executeMoveOrCopy}
                  className="flex-1 py-3"
                >
                  {moveModal.type === 'move' ? 'Move' : 'Copy'}
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMoveModal(null);
                    setSelectedDestFolder("");
                  }}
                  className="flex-1 py-3"
                >
                  Cancel
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
