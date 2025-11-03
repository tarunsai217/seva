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
  Languages,
} from "lucide-react";

// Translations
const translations = {
  en: {
    headerTitle: "Your Voice Matters",
    headerSubtitle: "Submit your complaint and we will reach out to you",
    stickyHeader: "Submit your complaint",
    restoredBanner: "✓ Restored your previous inputs",
    complaint: "Complaint",
    complaintPlaceholder: "Describe your complaint briefly...",
    complaintRequired: "Complaint is required",
    complaintMax: "Complaint must be 250 characters or less",
    description: "Description (Optional)",
    descriptionPlaceholder: "Add more details if needed...",
    image: "Image (Optional)",
    imageUploadText: "Click to upload image",
    imageUploadSubtext: "JPG, PNG or WebP (max 10MB)",
    compressing: "Compressing image...",
    name: "Your Name",
    namePlaceholder: "Enter your full name",
    nameRequired: "Name is required",
    nameMin: "Name must be at least 2 characters",
    nameInvalid: "Name cannot be only numbers",
    mobile: "Mobile Number",
    mobilePlaceholder: "Enter 10-digit mobile number",
    mobileRequired: "Mobile number is required",
    mobileInvalid: "Enter valid 10-digit mobile number",
    address: "Address",
    addressPlaceholder:
      "Enter your complete address (House/Flat no, Street, Area, Landmark, City)",
    addressRequired: "Address is required",
    change: "Change",
    near: "Near:",
    selectAddress: "Click to select address",
    required: "*",
    fillComplaint: "Fill Complaint Field",
    fixComplaintError: "Fix Complaint Error",
    fillName: "Fill Name Field",
    fixNameError: "Fix Name Error",
    fillMobile: "Fill Mobile Number",
    fixMobileError: "Fix Mobile Number",
    fillAddress: "Fill Address",
    fixAddressError: "Fix Address Error",
    submitComplaint: "Submit Complaint",
    successTitle: "Complaint Received!",
    successMessage:
      "Your complaint has been received. We will contact you soon.",
    close: "Close",
    saveAddress: "Save Address",
  },
  hi: {
    headerTitle: "आपकी आवाज़ मायने रखती है",
    headerSubtitle: "अपनी शिकायत दर्ज करें और हम आपसे संपर्क करेंगे",
    stickyHeader: "अपनी शिकायत दर्ज करें",
    restoredBanner: "✓ आपका पिछला डेटा पुनर्स्थापित किया गया",
    complaint: "शिकायत",
    complaintPlaceholder: "अपनी शिकायत संक्षेप में बताएं...",
    complaintRequired: "शिकायत आवश्यक है",
    complaintMax: "शिकायत 250 अक्षरों से कम होनी चाहिए",
    description: "विवरण (वैकल्पिक)",
    descriptionPlaceholder: "यदि आवश्यक हो तो अधिक विवरण जोड़ें...",
    image: "फोटो (वैकल्पिक)",
    imageUploadText: "फोटो अपलोड करने के लिए क्लिक करें",
    imageUploadSubtext: "JPG, PNG या WebP (अधिकतम 10MB)",
    compressing: "फोटो संपीड़ित हो रही है...",
    name: "आपका नाम",
    namePlaceholder: "अपना पूरा नाम दर्ज करें",
    nameRequired: "नाम आवश्यक है",
    nameMin: "नाम कम से कम 2 अक्षरों का होना चाहिए",
    nameInvalid: "नाम केवल संख्याओं में नहीं हो सकता",
    mobile: "मोबाइल नंबर",
    mobilePlaceholder: "10 अंकों का मोबाइल नंबर दर्ज करें",
    mobileRequired: "मोबाइल नंबर आवश्यक है",
    mobileInvalid: "मान्य 10 अंकों का मोबाइल नंबर दर्ज करें",
    address: "पता",
    addressPlaceholder:
      "अपना पूरा पता दर्ज करें (मकान/फ्लैट नंबर, गली, क्षेत्र, लैंडमार्क, शहर)",
    addressRequired: "पता आवश्यक है",
    change: "बदलें",
    near: "के पास:",
    selectAddress: "पता चुनने के लिए क्लिक करें",
    required: "*",
    fillComplaint: "शिकायत भरें",
    fixComplaintError: "शिकायत में त्रुटि ठीक करें",
    fillName: "नाम भरें",
    fixNameError: "नाम में त्रुटि ठीक करें",
    fillMobile: "मोबाइल नंबर भरें",
    fixMobileError: "मोबाइल नंबर ठीक करें",
    fillAddress: "पता भरें",
    fixAddressError: "पते में त्रुटि ठीक करें",
    submitComplaint: "शिकायत दर्ज करें",
    successTitle: "शिकायत प्राप्त हुई!",
    successMessage:
      "आपकी शिकायत प्राप्त हो गई है। हम जल्द ही आपसे संपर्क करेंगे।",
    close: "बंद करें",
    saveAddress: "पता सेव करें",
  },
};

// Image compression utility
const compressImage = async (file) => {
  try {
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

// Simple Address Picker Component
const AddressPickerModal = ({
  isOpen,
  onClose,
  onAddressSelect,
  initialAddress,
  language,
}) => {
  const t = translations[language];
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
          <h3 className="text-lg font-semibold">{t.selectAddress}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600 text-center">
            <MapPin className="mx-auto mb-2" size={32} />
            <p>Map integration placeholder</p>
            <p className="text-xs mt-1">Click on map to select location</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.address} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tempAddress.address}
              onChange={(e) =>
                setTempAddress({ ...tempAddress, address: e.target.value })
              }
              placeholder={t.addressPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            {t.saveAddress}
          </button>
        </div>
      </div>
    </div>
  );
};

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, language }) => {
  const t = translations[language];

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
        <h3 className="text-xl font-semibold mb-2">{t.successTitle}</h3>
        <p className="text-gray-600 mb-6">{t.successMessage}</p>
        <button
          onClick={onClose}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};

// Main App Component
const ComplaintSubmissionApp = () => {
  const [language, setLanguage] = useState("en");
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

  const USE_SIMPLE_ADDRESS_INPUT = true;

  const fileInputRef = useRef(null);
  const headerRef = useRef(null);
  const formRefs = {
    complaint: useRef(null),
    name: useRef(null),
    mobile: useRef(null),
    address: useRef(null),
  };

  const STORAGE_KEY = "complaint_form_data";

  // Get current translations
  const t = translations[language];

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
        if (!value || !value.trim()) return t.complaintRequired;
        if (value.length > 250) return t.complaintMax;
        return null;

      case "name":
        if (!value || !value.trim()) return t.nameRequired;
        if (value.trim().length < 2) return t.nameMin;
        if (/^\d+$/.test(value)) return t.nameInvalid;
        return null;

      case "mobile":
        if (!value) return t.mobileRequired;
        if (!/^[6-9]\d{9}$/.test(value)) return t.mobileInvalid;
        return null;

      case "address":
        if (!value) return t.addressRequired;
        if (
          USE_SIMPLE_ADDRESS_INPUT &&
          (!value.address || !value.address.trim())
        ) {
          return t.addressRequired;
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
    let firstErrorField = null;

    if (!formData.complaint || !formData.complaint.trim() || errors.complaint) {
      firstErrorField = "complaint";
    } else if (!formData.name || !formData.name.trim() || errors.name) {
      firstErrorField = "name";
    } else if (!formData.mobile || !formData.mobile.trim() || errors.mobile) {
      firstErrorField = "mobile";
    } else if (
      !formData.address ||
      !formData.address.address ||
      !formData.address.address.trim() ||
      errors.address
    ) {
      firstErrorField = "address";
    }

    if (firstErrorField && formRefs[firstErrorField]?.current) {
      const element = formRefs[firstErrorField].current;
      const yOffset = -120;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });

      element.classList.add("animate-shake");
      setTimeout(() => {
        element.classList.remove("animate-shake");
      }, 500);

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
      setTimeout(() => {
        scrollToFirstError();
      }, 100);
      return;
    }

    const message = `*शिकायत विवरण / Complaint Details*
    
*नाम / Name:* ${formData.name}
*मोबाइल / Mobile:* ${formData.mobile}

*शिकायत / Complaint:*
${formData.complaint}

${
  formData.description
    ? `*विवरण / Description:*\n${formData.description}\n`
    : ""
}
*पता / Address:*
${formData.address.address}

---
शेखर राय को शिकायत
Complaint to Shekhar Rai`;

    const whatsappNumber = "919876543210";
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, "_blank");

    sessionStorage.removeItem(STORAGE_KEY);
    setIsSuccessModalOpen(true);

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
    if (!formData.complaint || !formData.complaint.trim()) {
      return t.fillComplaint;
    }
    if (errors.complaint) {
      return t.fixComplaintError;
    }
    if (!formData.name || !formData.name.trim()) {
      return t.fillName;
    }
    if (errors.name) {
      return t.fixNameError;
    }
    if (!formData.mobile || !formData.mobile.trim()) {
      return t.fillMobile;
    }
    if (errors.mobile) {
      return t.fixMobileError;
    }
    if (
      !formData.address ||
      !formData.address.address ||
      !formData.address.address.trim()
    ) {
      return t.fillAddress;
    }
    if (errors.address) {
      return t.fixAddressError;
    }
    return t.submitComplaint;
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
      {showRestoredBanner && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-orange-500 text-white py-2 px-4 text-center text-sm animate-slide-down">
          {t.restoredBanner}
        </div>
      )}

      <div
        ref={headerRef}
        className="bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg"
      >
        <div className="max-w-2xl mx-auto px-4 py-8 text-center relative">
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <Languages size={18} />
            {language === "en" ? "हिं" : "EN"}
          </button>

          <img
            src="/shekhar-rai.jpeg"
            alt="Shekhar Rai"
            className="w-28 h-28 mx-auto rounded-full object-cover border-4 border-white shadow-xl mb-4"
          />
          {language === "en" ? (
            <h1 className="text-2xl font-bold text-white mb-1">Shekhar Rai</h1>
          ) : (
            <h1 className="text-xl font-medium text-white mb-1">शेखर राय</h1>
          )}
          <p className="text-orange-100 text-sm">{t.headerTitle}</p>
          <p className="text-orange-50 text-xs mt-2">{t.headerSubtitle}</p>
        </div>
      </div>

      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-white shadow-md transition-transform duration-300 ${
          isHeaderSticky ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/shekhar-rai.jpeg"
                alt="Shekhar Rai"
                className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
              />
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Shekhar Rai
                </h2>
                <p className="text-xs text-gray-600">{t.stickyHeader}</p>
              </div>
            </div>
            <button
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="bg-orange-100 hover:bg-orange-200 text-orange-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
            >
              <Languages size={16} />
              {language === "en" ? "हिं" : "EN"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div ref={formRefs.complaint}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline mr-1" size={16} />
            {t.complaint} <span className="text-red-500">{t.required}</span>
          </label>
          <textarea
            value={formData.complaint}
            onChange={(e) => handleChange("complaint", e.target.value)}
            onBlur={() => handleBlur("complaint")}
            placeholder={t.complaintPlaceholder}
            maxLength={250}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.description}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder={t.descriptionPlaceholder}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ImageIcon className="inline mr-1" size={16} />
            {t.image}
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
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-8 px-4 hover:border-orange-500 transition-colors disabled:opacity-50"
              >
                {isCompressing ? (
                  <div className="text-center">
                    <div className="animate-spin mx-auto mb-2 w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
                    <p className="text-sm text-gray-600">{t.compressing}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-sm text-gray-600">{t.imageUploadText}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t.imageUploadSubtext}
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

        <div ref={formRefs.name}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline mr-1" size={16} />
            {t.name} <span className="text-red-500">{t.required}</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            placeholder={t.namePlaceholder}
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

        <div ref={formRefs.mobile}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline mr-1" size={16} />
            {t.mobile} <span className="text-red-500">{t.required}</span>
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
            placeholder={t.mobilePlaceholder}
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

        <div ref={formRefs.address}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline mr-1" size={16} />
            {t.address} <span className="text-red-500">{t.required}</span>
          </label>

          {USE_SIMPLE_ADDRESS_INPUT ? (
            <div>
              <textarea
                value={formData.address?.address || ""}
                onChange={(e) =>
                  handleChange("address", { address: e.target.value })
                }
                onBlur={() => handleBlur("address")}
                placeholder={t.addressPlaceholder}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${
                  errors.address && touched.address
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
            </div>
          ) : formData.address ? (
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
                  {t.change}
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {formData.address.address}
              </p>
              {formData.address.landmark && (
                <p className="text-xs text-gray-500 mt-1">
                  {t.near} {formData.address.landmark}
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
              <p className="text-sm text-gray-600">{t.selectAddress}</p>
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

      {!USE_SIMPLE_ADDRESS_INPUT && (
        <AddressPickerModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onAddressSelect={(address) => {
            handleChange("address", address);
            handleBlur("address");
          }}
          initialAddress={formData.address}
          language={language}
        />
      )}

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        language={language}
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
