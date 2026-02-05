 import { useState, useCallback, useRef } from 'react';
 import { Upload, X, ImageIcon, Loader2, FileArchive } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { Button } from '@/components/ui/button';
 import { useFileUpload } from '@/hooks/useFileUpload';
 import { Progress } from '@/components/ui/progress';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { toast } from 'sonner';
 import JSZip from 'jszip';
 
 export interface BatchImage {
   id: string;
   file: File;
   previewUrl: string;
   uploadedUrl?: string;
   uploadedPath?: string;
   status: 'pending' | 'uploading' | 'uploaded' | 'error';
 }
 
 interface BatchUploadZoneProps {
   images: BatchImage[];
   onImagesChange: (images: BatchImage[]) => void;
   disabled?: boolean;
   className?: string;
 }
 
 export function BatchUploadZone({ images: imagesProp, onImagesChange, disabled, className }: BatchUploadZoneProps) {
   const [isDragging, setIsDragging] = useState(false);
   const [isExtractingZip, setIsExtractingZip] = useState(false);
   const { uploadFile } = useFileUpload();
   const imagesRef = useRef(imagesProp);
   imagesRef.current = imagesProp;
 
   const handleDrop = useCallback(async (e: React.DragEvent) => {
     e.preventDefault();
     setIsDragging(false);
     if (disabled) return;
 
     const droppedFiles = Array.from(e.dataTransfer.files);
     await processDroppedFiles(droppedFiles);
   }, [disabled]);
 
   const processDroppedFiles = async (files: File[]) => {
     const imageFiles: File[] = [];
     const zipFiles: File[] = [];
 
     for (const file of files) {
       if (file.type.startsWith('image/')) {
         imageFiles.push(file);
       } else if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.endsWith('.zip')) {
         zipFiles.push(file);
       }
     }
 
     // Extract images from ZIP files
     for (const zipFile of zipFiles) {
       const extractedImages = await extractImagesFromZip(zipFile);
       imageFiles.push(...extractedImages);
     }
 
     if (imageFiles.length > 0) {
       await addFiles(imageFiles);
     } else if (zipFiles.length > 0) {
       toast.error('No images found in ZIP file');
     }
   };
 
   const extractImagesFromZip = async (zipFile: File): Promise<File[]> => {
     setIsExtractingZip(true);
     const extractedFiles: File[] = [];
 
     try {
       const zip = await JSZip.loadAsync(zipFile);
       const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
 
       const promises: Promise<void>[] = [];
 
       zip.forEach((relativePath, zipEntry) => {
         if (zipEntry.dir) return;
 
         const fileName = relativePath.split('/').pop() || relativePath;
         const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
 
         if (imageExtensions.includes(ext)) {
           const promise = zipEntry.async('blob').then(blob => {
             const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
             const file = new File([blob], fileName, { type: mimeType });
             extractedFiles.push(file);
           });
           promises.push(promise);
         }
       });
 
       await Promise.all(promises);
       toast.success(`Extracted ${extractedFiles.length} images from ${zipFile.name}`);
     } catch (error) {
       console.error('Error extracting ZIP:', error);
       toast.error(`Failed to extract ${zipFile.name}`);
     } finally {
       setIsExtractingZip(false);
     }
 
     return extractedFiles;
   };
 
   const addFiles = async (files: File[]) => {
     const newImages: BatchImage[] = files.map(file => ({
       id: crypto.randomUUID(),
       file,
       previewUrl: URL.createObjectURL(file),
       status: 'pending' as const,
     }));
 
     const updatedImages = [...imagesRef.current, ...newImages];
     onImagesChange(updatedImages);
 
     // Upload each file
     for (const img of newImages) {
       onImagesChange(imagesRef.current.map(i => 
         i.id === img.id ? { ...i, status: 'uploading' as const } : i
       ));
       imagesRef.current = imagesRef.current.map(i => 
         i.id === img.id ? { ...i, status: 'uploading' as const } : i
       );
 
       const result = await uploadFile(img.file);
       
       if (result) {
         const updated = imagesRef.current.map(i => 
           i.id === img.id ? { 
             ...i, 
             status: 'uploaded' as const,
             uploadedUrl: result.url,
             uploadedPath: result.path,
           } : i
         );
         imagesRef.current = updated;
         onImagesChange(updated);
       } else {
         const updated = imagesRef.current.map(i => 
           i.id === img.id ? { ...i, status: 'error' as const } : i
         );
         imagesRef.current = updated;
         onImagesChange(updated);
       }
     }
   };
 
   const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = Array.from(e.target.files || []);
     if (files.length > 0) await processDroppedFiles(files);
     e.target.value = '';
   };
 
   const removeImage = (id: string) => {
     const img = imagesProp.find(i => i.id === id);
     if (img) {
       URL.revokeObjectURL(img.previewUrl);
       onImagesChange(imagesProp.filter(i => i.id !== id));
     }
   };
 
   const clearAll = () => {
     imagesProp.forEach(img => URL.revokeObjectURL(img.previewUrl));
     onImagesChange([]);
   };
 
   const uploadedCount = imagesProp.filter(i => i.status === 'uploaded').length;
   const uploadingCount = imagesProp.filter(i => i.status === 'uploading').length;
 
   return (
     <div className={cn("space-y-4", className)}>
       {/* Drop zone */}
       <div
         className={cn(
           "relative rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden",
           isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
           disabled && "opacity-50 pointer-events-none"
         )}
         onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
         onDragLeave={() => setIsDragging(false)}
         onDrop={handleDrop}
       >
         <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
           <input
             type="file"
             accept="image/jpeg,image/png,image/webp,.zip,application/zip"
             multiple
             className="hidden"
             onChange={handleFileInput}
             disabled={disabled}
           />
           <div className={cn(
             "p-4 rounded-full mb-4 transition-all duration-300",
             isDragging ? "bg-primary/20" : "bg-muted"
           )}>
             {isExtractingZip ? (
               <Loader2 className="w-8 h-8 text-primary animate-spin" />
             ) : isDragging ? (
               <ImageIcon className="w-8 h-8 text-primary" />
             ) : (
               <Upload className="w-8 h-8 text-muted-foreground" />
             )}
           </div>
           <p className="text-sm font-medium mb-1">
             {isExtractingZip ? "Extracting ZIP..." : isDragging ? "Drop images or ZIP here" : "Upload images or ZIP file"}
           </p>
           <p className="text-xs text-muted-foreground text-center">
             Drag & drop images or a ZIP file<br />
             PNG, JPG, WebP, ZIP supported
           </p>
         </label>
       </div>
 
       {/* Image list */}
       {imagesProp.length > 0 && (
         <div className="space-y-3">
           <div className="flex items-center justify-between">
             <p className="text-sm text-muted-foreground">
               {uploadedCount}/{imagesProp.length} uploaded
               {uploadingCount > 0 && ` (${uploadingCount} uploading...)`}
             </p>
             <Button variant="ghost" size="sm" onClick={clearAll} disabled={disabled}>
               Clear All
             </Button>
           </div>
           
           <ScrollArea className="h-[200px]">
             <div className="space-y-2 pr-4">
               {imagesProp.map((img) => (
                 <div
                   key={img.id}
                   className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border"
                 >
                   <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                     <img
                       src={img.previewUrl}
                       alt={img.file.name}
                       className="w-full h-full object-cover"
                     />
                     {img.status === 'uploading' && (
                       <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                         <Loader2 className="w-4 h-4 animate-spin text-primary" />
                       </div>
                     )}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium truncate">{img.file.name}</p>
                     <p className="text-xs text-muted-foreground">
                       {img.status === 'pending' && 'Waiting...'}
                       {img.status === 'uploading' && 'Uploading...'}
                       {img.status === 'uploaded' && 'Ready'}
                       {img.status === 'error' && 'Upload failed'}
                     </p>
                   </div>
                   
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-8 w-8 flex-shrink-0"
                     onClick={() => removeImage(img.id)}
                     disabled={disabled || img.status === 'uploading'}
                   >
                     <X className="w-4 h-4" />
                   </Button>
                 </div>
               ))}
             </div>
           </ScrollArea>
         </div>
       )}
     </div>
   );
 }