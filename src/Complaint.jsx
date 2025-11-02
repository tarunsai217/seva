import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  FileText,
  ImageIcon,
} from "lucide-react";

// Image compression utility using browser-image-compression
const compressImage = async (file) => {
  try {
    // Dynamic import simulation - in production, install: npm install browser-image-compression
    // For now, using canvas-based compression as fallback
    const options = {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 1024,
      initialQuality: 0.9,
      useWebWorker: true,
    };

    // Canvas-based compression fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          const maxDimension = 1024;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP with quality adjustment
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({
                  blob,
                  dataUrl: canvas.toDataURL("image/webp", 0.9),
                  size: blob.size,
                });
              } else {
                reject(new Error("Compression failed"));
              }
            },
            "image/webp",
            0.9
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  } catch (error) {
    throw new Error("Image compression failed: " + error.message);
  }
};

// Simple Address Picker Component (placeholder - you'll integrate your existing component)
const AddressPickerModal = ({
  isOpen,
  onClose,
  onAddressSelect,
  initialAddress,
}) => {
  const [tempAddress, setTempAddress] = useState(
    initialAddress || {
      coordinates: null,
      address: "",
      flatNumber: "",
      landmark: "",
    }
  );

  useEffect(() => {
    if (initialAddress) {
      setTempAddress(initialAddress);
    }
  }, [initialAddress]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!tempAddress.address || !tempAddress.flatNumber) {
      alert("Please fill all address fields");
      return;
    }
    onAddressSelect(tempAddress);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Address</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600 text-center">
            {/* Placeholder for map - integrate your DeliveryLocationPicker here */}
            <MapPin className="mx-auto mb-2" size={32} />
            <p>Map integration placeholder</p>
            <p className="text-xs mt-1">Click on map to select location</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tempAddress.address}
              onChange={(e) =>
                setTempAddress({ ...tempAddress, address: e.target.value })
              }
              placeholder="Street, Area, City"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flat/House No. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tempAddress.flatNumber}
              onChange={(e) =>
                setTempAddress({ ...tempAddress, flatNumber: e.target.value })
              }
              placeholder="Flat number, Floor"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={tempAddress.landmark}
              onChange={(e) =>
                setTempAddress({ ...tempAddress, landmark: e.target.value })
              }
              placeholder="Nearby landmark"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Save Address
          </button>
        </div>
      </div>
    </div>
  );
};

// Success Modal Component
const SuccessModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 30000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-sm p-6 text-center animate-scale-in">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
        <h3 className="text-xl font-semibold mb-2">Complaint Received!</h3>
        <p className="text-gray-600 mb-6">
          Your complaint has been received. We will contact you soon.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Main App Component
const ComplaintSubmissionApp = () => {
  const [formData, setFormData] = useState({
    complaint: "",
    description: "",
    name: "",
    mobile: "",
    address: null,
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showRestoredBanner, setShowRestoredBanner] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);

  // Feature flag for address input type
  const USE_SIMPLE_ADDRESS_INPUT = true; // Set to false to use popup modal

  const fileInputRef = useRef(null);
  const headerRef = useRef(null);
  const formRefs = {
    complaint: useRef(null),
    name: useRef(null),
    mobile: useRef(null),
    address: useRef(null),
  };

  // Session storage key
  const STORAGE_KEY = "complaint_form_data";

  // Load from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        if (parsed.imagePreview) {
          setImagePreview(parsed.imagePreview);
        }
        setShowRestoredBanner(true);
        setTimeout(() => setShowRestoredBanner(false), 5000);
      } catch (e) {
        console.error("Failed to restore data:", e);
      }
    }
  }, []);

  // Intersection Observer for sticky header
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
    };
  }, []);

  // Save to session storage on every change
  useEffect(() => {
    const dataToSave = { ...formData };
    if (imagePreview) {
      dataToSave.imagePreview = imagePreview;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData, imagePreview]);

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case "complaint":
        if (!value || !value.trim()) return "Complaint is required";
        if (value.length > 250)
          return "Complaint must be 250 characters or less";
        return null;

      case "name":
        if (!value || !value.trim()) return "Name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        if (/^\d+$/.test(value)) return "Name cannot be only numbers";
        return null;

      case "mobile":
        if (!value) return "Mobile number is required";
        if (!/^[6-9]\d{9}$/.test(value))
          return "Enter valid 10-digit mobile number";
        return null;

      case "address":
        if (!value) return "Address is required";
        // For simple input mode, check if address field has value
        if (
          USE_SIMPLE_ADDRESS_INPUT &&
          (!value.address || !value.address.trim())
        ) {
          return "Address is required";
        }
        return null;

      default:
        return null;
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, formData[field]);
    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    if (touched[field]) {
      const error = validateField(field, value);
      setErrors({ ...errors, [field]: error });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload JPG, PNG, or WebP image");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be less than 10MB");
      return;
    }

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      setFormData({ ...formData, image: compressed.blob });
      setImagePreview(compressed.dataUrl);
    } catch (error) {
      console.error("Compression failed:", error);
      alert("Failed to process image. Please try another image.");
    } finally {
      setIsCompressing(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const scrollToFirstError = () => {
    // Find the first field that has an error or is empty - CHECK IN ORDER
    let firstErrorField = null;

    // Check complaint first
    if (!formData.complaint || !formData.complaint.trim() || errors.complaint) {
      firstErrorField = "complaint";
    }
    // Then check name
    else if (!formData.name || !formData.name.trim() || errors.name) {
      firstErrorField = "name";
    }
    // Then check mobile
    else if (!formData.mobile || !formData.mobile.trim() || errors.mobile) {
      firstErrorField = "mobile";
    }
    // Finally check address
    else if (
      !formData.address ||
      !formData.address.address ||
      !formData.address.address.trim() ||
      errors.address
    ) {
      firstErrorField = "address";
    }

    console.log("First error field:", firstErrorField, "Form data:", formData);

    if (firstErrorField && formRefs[firstErrorField]?.current) {
      // Scroll with offset for better visibility
      const element = formRefs[firstErrorField].current;
      const yOffset = -120; // Offset from top to account for sticky header
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });

      // Add shake animation
      element.classList.add("animate-shake");
      setTimeout(() => {
        element.classList.remove("animate-shake");
      }, 500);

      // Focus the input if it's an input field
      setTimeout(() => {
        const input = element.querySelector("input, textarea");
        if (input) {
          input.focus();
        }
      }, 600);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    ["complaint", "name", "mobile", "address"].forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({
      complaint: true,
      name: true,
      mobile: true,
      address: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);

    if (!validateForm()) {
      // Small delay to ensure state is updated before scrolling
      setTimeout(() => {
        scrollToFirstError();
      }, 100);
      return;
    }

    // Submit logic here
    console.log("Submitting:", formData);

    // Clear session storage
    sessionStorage.removeItem(STORAGE_KEY);

    // Show success modal
    setIsSuccessModalOpen(true);

    // Reset form
    setFormData({
      complaint: "",
      description: "",
      name: "",
      mobile: "",
      address: null,
      image: null,
    });
    setImagePreview(null);
    setErrors({});
    setTouched({});
    setSubmitAttempted(false);
  };

  const getSubmitButtonText = () => {
    // Check in order: complaint -> name -> mobile -> address
    if (!formData.complaint || !formData.complaint.trim()) {
      return "Fill Complaint Field";
    }
    if (errors.complaint) {
      return "Fix Complaint Error";
    }
    if (!formData.name || !formData.name.trim()) {
      return "Fill Name Field";
    }
    if (errors.name) {
      return "Fix Name Error";
    }
    if (!formData.mobile || !formData.mobile.trim()) {
      return "Fill Mobile Number";
    }
    if (errors.mobile) {
      return "Fix Mobile Number";
    }
    if (
      !formData.address ||
      !formData.address.address ||
      !formData.address.address.trim()
    ) {
      return "Fill Address";
    }
    if (errors.address) {
      return "Fix Address Error";
    }
    return "Submit Complaint";
  };

  const isFormValid = () => {
    return (
      formData.complaint &&
      formData.complaint.trim() &&
      formData.name &&
      formData.name.trim() &&
      formData.mobile &&
      formData.mobile.trim() &&
      formData.address &&
      formData.address.address &&
      formData.address.address.trim() &&
      !errors.complaint &&
      !errors.name &&
      !errors.mobile &&
      !errors.address
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Restored Banner */}
      {showRestoredBanner && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-orange-500 text-white py-2 px-4 text-center text-sm animate-slide-down">
          ✓ Restored your previous inputs
        </div>
      )}

      {/* Header - Centered for attraction - BJP Theme */}
      <div
        ref={headerRef}
        className="bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg"
      >
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <img
            src="/shekhar-rai.jpeg"
            alt="Shekhar Rai"
            className="w-28 h-28 mx-auto rounded-full object-cover border-4 border-white shadow-xl mb-4"
          />
          <h1 className="text-2xl font-bold text-white mb-1">Shekhar Rai</h1>
          <p className="text-orange-100 text-sm">Your Voice Matters</p>
          <p className="text-orange-50 text-xs mt-2">
            Submit your complaint and we will reach out to you
          </p>
        </div>
      </div>

      {/* Sticky Header - Shows when main header is out of view */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-white shadow-md transition-transform duration-300 ${
          isHeaderSticky ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <img
              src="/shekhar-rai.jpeg"
              alt="Shekhar Rai"
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
            />
            <div>
              <h2 className="text-base font-bold text-gray-900">Shekhar Rai</h2>
              <p className="text-xs text-gray-600">Submit your complaint</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Complaint Text */}
        <div ref={formRefs.complaint}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline mr-1" size={16} />
            Complaint <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.complaint}
            onChange={(e) => handleChange("complaint", e.target.value)}
            onBlur={() => handleBlur("complaint")}
            placeholder="Describe your complaint briefly..."
            maxLength={250}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.complaint && touched.complaint
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            <div>
              {errors.complaint && touched.complaint && (
                <p className="text-red-500 text-xs flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  {errors.complaint}
                </p>
              )}
            </div>
            <p
              className={`text-xs ${
                formData.complaint.length > 240
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {formData.complaint.length}/250
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Add more details if needed..."
            maxLength={250}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
          <p
            className={`text-xs text-right mt-1 ${
              formData.description.length > 230
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {formData.description.length}/250
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ImageIcon className="inline mr-1" size={16} />
            Image (Optional)
          </label>

          {!imagePreview ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-8 px-4 hover:border-blue-500 transition-colors disabled:opacity-50"
              >
                {isCompressing ? (
                  <div className="text-center">
                    <div className="animate-spin mx-auto mb-2 w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
                    <p className="text-sm text-gray-600">
                      Compressing image...
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-sm text-gray-600">
                      Click to upload image
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG or WebP (max 10MB)
                    </p>
                  </div>
                )}
              </button>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {formData.image
                  ? `${(formData.image.size / 1024).toFixed(0)} KB`
                  : ""}
              </div>
            </div>
          )}
        </div>

        {/* Name */}
        <div ref={formRefs.name}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline mr-1" size={16} />
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            placeholder="Enter your full name"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.name && touched.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && touched.name && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Mobile */}
        <div ref={formRefs.mobile}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline mr-1" size={16} />
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.mobile}
            onChange={(e) =>
              handleChange(
                "mobile",
                e.target.value.replace(/\D/g, "").slice(0, 10)
              )
            }
            onBlur={() => handleBlur("mobile")}
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.mobile && touched.mobile
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {errors.mobile && touched.mobile && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {errors.mobile}
            </p>
          )}
        </div>

        {/* Address */}
        <div ref={formRefs.address}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline mr-1" size={16} />
            Address <span className="text-red-500">*</span>
          </label>

          {USE_SIMPLE_ADDRESS_INPUT ? (
            // Simple single text input for address (current version)
            <div>
              <textarea
                value={formData.address?.address || ""}
                onChange={(e) =>
                  handleChange("address", { address: e.target.value })
                }
                onBlur={() => handleBlur("address")}
                placeholder="Enter your complete address (House/Flat no, Street, Area, Landmark, City)"
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${
                  errors.address && touched.address
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
            </div>
          ) : // Modal popup for address (future version - Zomato style)
          formData.address ? (
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-900">
                  {formData.address.flatNumber}
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-blue-600 text-xs hover:underline"
                >
                  Change
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {formData.address.address}
              </p>
              {formData.address.landmark && (
                <p className="text-xs text-gray-500 mt-1">
                  Near: {formData.address.landmark}
                </p>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(true)}
              className={`w-full border-2 border-dashed rounded-lg py-4 px-4 hover:border-orange-500 transition-colors ${
                errors.address && touched.address
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <MapPin className="mx-auto mb-2 text-gray-400" size={24} />
              <p className="text-sm text-gray-600">Click to select address</p>
            </button>
          )}

          {errors.address && touched.address && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {errors.address}
            </p>
          )}
        </div>
      </div>

      {/* Sticky Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid() && submitAttempted}
            className={`w-full py-4 rounded-lg font-medium transition-all ${
              isFormValid()
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            } ${submitAttempted && !isFormValid() ? "animate-shake" : ""}`}
          >
            {getSubmitButtonText()}
          </button>
        </div>
      </div>

      {/* Address Modal - Only shown when USE_SIMPLE_ADDRESS_INPUT is false */}
      {!USE_SIMPLE_ADDRESS_INPUT && (
        <AddressPickerModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onAddressSelect={(address) => {
            handleChange("address", address);
            handleBlur("address");
          }}
          initialAddress={formData.address}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes slide-down {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-shake {
          animation: shake 0.5s;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ComplaintSubmissionApp;
