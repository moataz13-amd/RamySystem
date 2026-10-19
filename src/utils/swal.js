import Swal from 'sweetalert2';

export const customSwal = Swal.mixin({
    customClass: {
        confirmButton: 'bg-accent hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all mx-2',
        cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold transition-all mx-2',
        popup: 'rounded-3xl shadow-xl border border-gray-100',
        input: 'border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent w-[85%] mx-auto',
    },
    buttonsStyling: false,
    confirmButtonText: 'تأكيد',
    cancelButtonText: 'إلغاء'
});

export const showPasswordPrompt = async (title, isAr) => {
    const { value } = await customSwal.fire({
        title,
        input: 'password',
        inputPlaceholder: isAr ? 'أدخل كلمة المرور...' : 'Enter password...',
        showCancelButton: true,
        confirmButtonText: isAr ? 'تأكيد' : 'Confirm',
        cancelButtonText: isAr ? 'إلغاء' : 'Cancel',
        inputValidator: (value) => {
            if (!value) return isAr ? 'لا يمكن ترك هذا الحقل فارغاً' : 'This field cannot be empty';
        }
    });
    return value;
};

export const showConfirm = async (title, text, isAr) => {
    const { isConfirmed } = await customSwal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: isAr ? 'تأكيد' : 'Confirm',
        cancelButtonText: isAr ? 'إلغاء' : 'Cancel',
    });
    return isConfirmed;
};

export const showSuccess = (title) => {
    return customSwal.fire({
        title,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        position: 'center'
    });
};

export const showError = (title) => {
    return customSwal.fire({
        title,
        icon: 'error',
        confirmButtonText: 'حسنًا',
    });
};
