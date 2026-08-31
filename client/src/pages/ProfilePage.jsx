import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Check, Mail, PencilLine, Trash2, User, X } from "lucide-react";

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [profileAction, setProfileAction] = useState("");
  const fileInputRef = useRef(null);
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();

  useEffect(() => {
    setFullName(authUser?.fullName || "");
    setNameDraft(authUser?.fullName || "");
  }, [authUser?.fullName]);

  const handleNameSave = async () => {
    const trimmedName = nameDraft.trim();
    if (!trimmedName || trimmedName === authUser?.fullName) return;

    try {
      setProfileAction("savingName");
      await updateProfile({ fullName: trimmedName });
      setFullName(trimmedName);
      setIsEditingName(false);
    } catch (err) {
      console.error("Failed to save name:", err);
    } finally {
      setProfileAction("");
    }
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
      try {
        setProfileAction("uploading");
        await updateProfile({ profilePic: base64Image });
      } catch (err) {
        console.error("Failed to upload photo:", err);
      } finally {
        setProfileAction("");
      }
    };
  };

  const handleDeleteImage = async () => {
    try {
      setProfileAction("deleting");
      await updateProfile({ deleteProfilePic: true });
      setSelectedImg(null);
    } catch (err) {
      console.error("Failed to delete profile picture:", err);
    } finally {
      setProfileAction("");
    }
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
                <button
                  type="button"
                  onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                  className={`
                    absolute inset-0 flex flex-col items-center justify-center rounded-full
                    bg-black/35 transition-opacity cursor-pointer text-white
                    ${showPhotoMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                    ${isUpdatingProfile ? "pointer-events-none" : ""}
                  `}
                  disabled={isUpdatingProfile}
                  aria-label="Edit profile picture"
                >
                  <div className="flex flex-col items-center gap-2">
                    <PencilLine className="w-6 h-6" />
                    <span className="text-xs font-medium">Edit photo</span>
                  </div>
                </button>

                <input
                  type="file"
                  id="avatar-upload"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />

                {showPhotoMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowPhotoMenu(false)}
                    />
                    <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] z-20 w-48 rounded-2xl border border-base-300 bg-base-100 shadow-xl overflow-hidden py-1">
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-base-200 text-sm font-medium text-base-content/80 text-left cursor-pointer"
                        onClick={() => {
                          setShowPhotoMenu(false);
                          fileInputRef.current.click();
                        }}
                      >
                        <Camera className="w-4 h-4 text-base-content/60" />
                        <span>Upload photo</span>
                      </button>
                      {authUser.profilePic && (
                        <button
                          type="button"
                          onClick={() => {
                            handleDeleteImage();
                            setShowPhotoMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-error/15 text-error text-sm font-medium border-t border-base-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete photo</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
              <p className="text-sm text-base-content/60">
                {isUpdatingProfile ? (
                  profileAction === "deleting"
                    ? "Removing photo..."
                    : profileAction === "savingName"
                      ? "Saving name..."
                      : "Uploading..."
                ) : (
                  "Hover and click the photo to edit it"
                )}
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