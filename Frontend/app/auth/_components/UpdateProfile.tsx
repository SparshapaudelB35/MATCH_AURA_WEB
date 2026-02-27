"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { handleUpdateProfile } from "@/lib/actions/auth-action";
import { useRouter } from "next/navigation";

import { UpdateUserData, updateUserSchema } from "../schema";

type UserShape = {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
    interests?: string[];
    bio?: string;
    imageUrl?: string;
    profileImages?: string[];
};

type SelectedGalleryItem = {
    file: File;
    preview: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const MAX_GALLERY_IMAGES = 6;

export default function UpdateUserForm({ user }: { user: UserShape }) {
    const router = useRouter();
    const imageInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<UpdateUserData>({
        resolver: zodResolver(updateUserSchema),
        values: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            username: user?.username || "",
            dateOfBirth: user?.dateOfBirth || "",
            gender: user?.gender || "other",
            interests: user?.interests?.join(", ") || "",
            bio: user?.bio || "",
            profileImages: [],
        },
    });

    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [existingGallery, setExistingGallery] = useState<string[]>(user?.profileImages || []);
    const [selectedGalleryItems, setSelectedGalleryItems] = useState<SelectedGalleryItem[]>([]);

    const handleImageChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
        onChange(file);
    };

    const handleGalleryChange = async (files: FileList | null, onChange: (files: File[]) => void) => {
        if (!files || files.length === 0) return;

        const availableSlots = MAX_GALLERY_IMAGES - existingGallery.length - selectedGalleryItems.length;
        if (availableSlots <= 0) {
            toast.error(`You can keep only ${MAX_GALLERY_IMAGES} gallery images`);
            return;
        }

        const incomingFiles = Array.from(files);
        const acceptedFiles = incomingFiles.slice(0, availableSlots);

        if (acceptedFiles.length < incomingFiles.length) {
            toast.info(`Only ${acceptedFiles.length} image(s) added due to 6-image limit.`);
        }

        const newItems = await Promise.all(
            acceptedFiles.map(
                (file) =>
                    new Promise<SelectedGalleryItem>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve({ file, preview: reader.result as string });
                        reader.readAsDataURL(file);
                    })
            )
        );

        const updatedItems = [...selectedGalleryItems, ...newItems];
        setSelectedGalleryItems(updatedItems);
        const updatedFiles = updatedItems.map((item) => item.file);
        onChange(updatedFiles);
        setValue("profileImages", updatedFiles, { shouldValidate: true });

        if (galleryInputRef.current) {
            galleryInputRef.current.value = "";
        }
    };

    const removeSelectedGalleryImage = (index: number) => {
        const updatedItems = selectedGalleryItems.filter((_, idx) => idx !== index);
        setSelectedGalleryItems(updatedItems);
        const updatedFiles = updatedItems.map((item) => item.file);
        setValue("profileImages", updatedFiles, { shouldValidate: true });
    };

    const removeExistingGalleryImage = (index: number) => {
        setExistingGallery((prev) => prev.filter((_, idx) => idx !== index));
    };

    const onSubmit = async (data: UpdateUserData) => {
        setError(null);
        try {
            const formData = new FormData();

            if (data.firstName) formData.append("firstName", data.firstName);
            if (data.lastName) formData.append("lastName", data.lastName);
            if (data.email) formData.append("email", data.email);
            formData.append("username", data.username);
            formData.append("dateOfBirth", data.dateOfBirth);
            formData.append("gender", data.gender);
            formData.append("interests", data.interests);
            formData.append("bio", data.bio);

            if (data.image) formData.append("image", data.image);
            formData.append("retainedProfileImages", JSON.stringify(existingGallery));
            (data.profileImages || []).forEach((file) => {
                formData.append("profileImages", file);
            });

            const response = await handleUpdateProfile(formData);
            if (!response.success) throw new Error(response.message || "Update profile failed");

            toast.success("Profile saved");
            router.push("/auth/dashboard");
            router.refresh();
        } catch (submitError: any) {
            toast.error(submitError.message || "Profile update failed");
            setError(submitError.message || "Profile update failed");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white px-4 py-10">
            <div className="mx-auto w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl">
                <h1 className="text-3xl font-extrabold text-zinc-900">Set up your dating profile</h1>
                <p className="mt-2 text-sm text-zinc-700">Add photos and details so people can get to know the real you.</p>

                <form className="mt-8 space-y-8" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
                    )}

                    <div>
                        <p className="mb-3 text-sm font-semibold text-zinc-900">Profile picture</p>

                        <div className="flex items-center gap-4">
                            {previewImage ? (
                                <img src={previewImage} alt="Profile preview" className="h-24 w-24 rounded-2xl object-cover ring-2 ring-rose-300" />
                            ) : user?.imageUrl ? (
                                <Image
                                    src={`${API_BASE_URL}${user.imageUrl}`}
                                    alt="Profile"
                                    width={96}
                                    height={96}
                                    className="h-24 w-24 rounded-2xl object-cover ring-2 ring-rose-300"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-zinc-100 text-xs text-zinc-600">No image</div>
                            )}

                            <Controller
                                name="image"
                                control={control}
                                render={({ field: { onChange } }) => (
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                                        className="block w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900 file:mr-3 file:rounded-lg file:border-0 file:bg-rose-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-rose-700"
                                    />
                                )}
                            />
                        </div>

                        {errors.image && <p className="mt-2 text-sm text-red-700">{errors.image.message}</p>}
                    </div>

                    <div>
                        <p className="mb-3 text-sm font-semibold text-zinc-900">Gallery images (up to 6)</p>

                        <Controller
                            name="profileImages"
                            control={control}
                            render={({ field: { onChange } }) => (
                                <input
                                    ref={galleryInputRef}
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={(e) => handleGalleryChange(e.target.files, onChange)}
                                    className="block w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-zinc-800"
                                />
                            )}
                        />

                        {errors.profileImages && (
                            <p className="mt-2 text-sm text-red-700">{errors.profileImages.message as string}</p>
                        )}

                        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                            {existingGallery.map((src, idx) => (
                                <div key={`existing-${src}-${idx}`} className="relative">
                                    <Image
                                        src={`${API_BASE_URL}${src}`}
                                        alt={`Gallery ${idx + 1}`}
                                        width={80}
                                        height={80}
                                        className="h-20 w-full rounded-xl object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingGalleryImage(idx)}
                                        className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}

                            {selectedGalleryItems.map((item, idx) => (
                                <div key={`selected-${item.preview}-${idx}`} className="relative">
                                    <img
                                        src={item.preview}
                                        alt={`Gallery preview ${idx + 1}`}
                                        className="h-20 w-full rounded-xl object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSelectedGalleryImage(idx)}
                                        className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-zinc-900">First Name</label>
                            <input
                                {...register("firstName")}
                                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                            />
                            {errors.firstName?.message && <p className="mt-1 text-sm text-red-700">{errors.firstName.message}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-zinc-900">Last Name</label>
                            <input
                                {...register("lastName")}
                                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                            />
                            {errors.lastName?.message && <p className="mt-1 text-sm text-red-700">{errors.lastName.message}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm font-semibold text-zinc-900">Email</label>
                            <input
                                type="email"
                                {...register("email")}
                                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                            />
                            {errors.email?.message && <p className="mt-1 text-sm text-red-700">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-zinc-900">Username</label>
                            <input
                                {...register("username")}
                                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                            />
                            {errors.username?.message && <p className="mt-1 text-sm text-red-700">{errors.username.message}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-zinc-900">Date of birth</label>
                            <input
                                type="date"
                                {...register("dateOfBirth")}
                                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                            />
                            {errors.dateOfBirth?.message && <p className="mt-1 text-sm text-red-700">{errors.dateOfBirth.message}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-zinc-900">Gender</label>
                            <select
                                {...register("gender")}
                                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.gender?.message && <p className="mt-1 text-sm text-red-700">{errors.gender.message}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-zinc-900">Interests</label>
                            <input
                                {...register("interests")}
                                placeholder="coffee, gym, anime"
                                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                            />
                            {errors.interests?.message && <p className="mt-1 text-sm text-red-700">{errors.interests.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-zinc-900">Bio</label>
                        <textarea
                            {...register("bio")}
                            rows={4}
                            placeholder="Tell people something interesting about you..."
                            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                        />
                        <p className="mt-1 text-xs text-zinc-600">Tip: Be real, specific, and positive</p>
                        {errors.bio?.message && <p className="mt-1 text-sm text-red-700">{errors.bio.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-fuchsia-600 py-3 font-semibold text-white shadow-lg hover:brightness-110 disabled:opacity-60"
                    >
                        {isSubmitting ? "Saving..." : "Continue"}
                    </button>
                </form>
            </div>
        </div>
    );
}
