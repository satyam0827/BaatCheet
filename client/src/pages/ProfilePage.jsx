import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Check, Mail, PencilLine, User, X } from "lucide-react";

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();

  useEffect(() => {
    setFullName(authUser?.fullName || "");
    setNameDraft(authUser?.fullName || "");
  }, [authUser?.fullName]);

  const handleNameSave = async () => {
    const trimmedName = nameDraft.trim();
    if (!trimmedName || trimmedName === authUser?.fullName) return;

    await updateProfile({ fullName: trimmedName });
    setFullName(trimmedName);
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setNameDraft(fullName);
    setIsEditingName(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-10 bg-base-200">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-[2rem] border border-base-300 bg-base-100 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-primary/15 via-base-100 to-base-200 px-6 py-8 border-b border-base-300">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Profile</h1>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <img
                  src={selectedImg || authUser.profilePic || "/profile.png"}
                  alt="Profile"
                  className="size-36 rounded-full object-cover border-4 border-base-200 shadow-lg"
                />
                <label
                  htmlFor="avatar-upload"
                  className={`
                    absolute inset-0 flex items-center justify-center rounded-full
                    bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer
                    ${isUpdatingProfile ? "pointer-events-none" : ""}
                  `}
                >
                  <div className="flex flex-col items-center gap-2 text-white">
                    <Camera className="w-6 h-6" />
                    <span className="text-xs font-medium">Change photo</span>
                  </div>
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>
              <p className="text-sm text-base-content/60">
                {isUpdatingProfile ? "Uploading..." : "Tap the photo to update it"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="text-sm text-base-content/60 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Name
                  </div>
                  {!isEditingName ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs gap-2"
                      onClick={() => setIsEditingName(true)}
                    >
                      <PencilLine className="size-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs gap-2"
                        onClick={handleNameCancel}
                        disabled={isUpdatingProfile}
                      >
                        <X className="size-4" />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleNameSave}
                        className="btn btn-primary btn-xs gap-2"
                        disabled={
                          isUpdatingProfile ||
                          !nameDraft.trim() ||
                          nameDraft.trim() === authUser?.fullName
                        }
                      >
                        <Check className="size-4" />
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingName ? (
                  <p className="text-lg font-medium px-1">{authUser?.fullName}</p>
                ) : (
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    className="w-full px-4 py-3 bg-base-100 rounded-xl border border-base-300 outline-none focus:border-primary"
                    placeholder="Enter your name"
                    disabled={isUpdatingProfile}
                  />
                )}
              </div>

              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-4">
                <div className="text-sm text-base-content/60 flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <p className="px-1 text-base-content/80">{authUser?.email}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-200/40 p-4">
              <h2 className="text-base font-semibold mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-base-300">
                  <span className="text-base-content/60">Member Since</span>
                  <span>{authUser.createdAt?.split("T")[0]}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-base-content/60">Account Status</span>
                  <span className="text-green-500">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;