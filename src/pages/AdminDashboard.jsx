import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Package, Users, ShoppingCart, TrendingUp, Truck, Edit, Trash2, Upload, X, Loader2, Printer, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosInstance';
import { productAPI, settingsAPI } from '../utils/api';
import { useReactToPrint } from 'react-to-print';
import PrintableInvoice from '../components/PrintableInvoice';
import { showSuccess, showError, showConfirm, showPasswordPrompt } from '../utils/swal';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
    const { user } = useAuth();
    const isAr = currentLanguage === 'ar';
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ totalSales: 0, ordersCount: 0, productsCount: 0, customersCount: 0 });

    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [deliveryAgents, setDeliveryAgents] = useState([]);
    const [assistants, setAssistants] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [governorates, setGovernorates] = useState([]);
    const [dbCategories, setDbCategories] = useState([]);
    const [categoryForm, setCategoryForm] = useState({ nameEn: '', nameAr: '', image: '' });
    const [editingCat, setEditingCat] = useState(null);
    const [showCatForm, setShowCatForm] = useState(false);
    const [catImgUploading, setCatImgUploading] = useState(false);
    const [coupons, setCoupons] = useState([]);
    const [couponForm, setCouponForm] = useState({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', maxUses: '', expiryDate: '' });
    const [showCouponForm, setShowCouponForm] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);

    // Print logic
    const componentRef = React.useRef(null);
    const [ordersToPrint, setOrdersToPrint] = useState([]);
    const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());

    const handlePrintFn = useReactToPrint({
        contentRef: componentRef,
        onAfterPrint: () => setOrdersToPrint([]),
    });

    const triggerPrint = (ordersArray) => {
        setOrdersToPrint(ordersArray);
        setTimeout(() => {
            handlePrintFn();
        }, 100);
    };

    const toggleOrderSelection = (id) => {
        const newSet = new Set(selectedOrderIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedOrderIds(newSet);
    };

    const selectAllOrders = () => {
        if (selectedOrderIds.size === orders.length && orders.length > 0) {
            setSelectedOrderIds(new Set());
        } else {
            setSelectedOrderIds(new Set(orders.map(o => o._id)));
        }
    };

    // Forms state
    const [showProductForm, setShowProductForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [uploading, setUploading] = useState(false);

    const initialProductForm = {
        nameEn: '',
        nameAr: '',
        price: '',
        discount: 0,
        descriptionEn: '',
        descriptionAr: '',
        brand: '',
        stock: '',
        category: 'sunglasses',
        imageUrl: '',
        warrantyAr: '',
        warrantyEn: ''
    };
    const [productForm, setProductForm] = useState(initialProductForm);
    const [imageUrls, setImageUrls] = useState([]);

    const [showAgentForm, setShowAgentForm] = useState(false);
    const [agentForm, setAgentForm] = useState({ name: '', email: '', password: '' });
    const [showAdminForm, setShowAdminForm] = useState(false);
    const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
    const [shippingDrafts, setShippingDrafts] = useState({});
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);

    const fetchAdminData = async () => {
        try {
            const [pRes, oRes, aRes, asRes, govRes, catRes, adminsRes, settingsRes] = await Promise.all([
                api.get('/products'),
                api.get('/orders'),
                api.get('/users/delivery').catch(() => ({ data: [] })),
                api.get('/users/assistant').catch(() => ({ data: [] })),
                api.get('/governorates').catch(() => ({ data: [] })),
                api.get('/categories').catch(() => ({ data: [] })),
                api.get('/users/admin').catch(() => ({ data: [] })),
                settingsAPI.get().catch(() => ({ data: { data: { freeShippingThreshold: 5000 } } }))
            ]);

            const productsList = pRes?.data?.data || pRes?.data || [];
            const ordersList = oRes?.data?.data || oRes?.data || [];
            const agentsList = aRes?.data?.data || aRes?.data || [];
            const assistantsList = asRes?.data?.data || asRes?.data || [];
            const adminsList = adminsRes?.data?.data || adminsRes?.data || [];
            const governoratesList = govRes?.data?.data || govRes?.data || [];
            const categoriesList = catRes?.data?.data || catRes?.data || [];

            setProducts(productsList);
            setOrders(ordersList);
            setDeliveryAgents(agentsList);
            setAssistants(assistantsList);
            setAdmins(adminsList);
            setGovernorates(governoratesList);
            setDbCategories(categoriesList);

            const threshold = settingsRes?.data?.data?.freeShippingThreshold || settingsRes?.data?.freeShippingThreshold || 5000;
            setFreeShippingThreshold(threshold);
            // Fetch coupons
            try {
                const cRes = await api.get('/coupons');
                setCoupons(cRes?.data?.data || []);
            } catch (e) { /* not admin */ }

            const totalSales = ordersList.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
            setStats({
                totalSales,
                ordersCount: ordersList.length,
                productsCount: productsList.length,
                customersCount: 0
            });

        } catch (error) {
            console.error('Failed to fetch admin data', error);
        }
    };

    useEffect(() => {
        if (!user || (!['admin', 'assistant'].includes(user.role))) {
            navigate('/login');
            return;
        }
        if (user.role === 'assistant' && !['dashboard', 'orders', 'products'].includes(activeTab)) {
            setActiveTab('orders');
        }
        fetchAdminData();
    }, [user, navigate, activeTab]);

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => formData.append('images', file));

        try {
            setUploading(true);
            const res = await productAPI.uploadMultipleImages(formData);
            const newUrls = res.data.urls;
            setImageUrls(prev => [...prev, ...newUrls]);
            showSuccess(isAr ? 'تم رفع الصور بنجاح' : 'Images uploaded successfully');
        } catch (err) {
            console.error('Upload failed details:', err.response?.data || err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            showError(isAr ? `فشل رفع الصور: ${errorMsg}` : `Images upload failed: ${errorMsg}`);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...productForm,
                price: Number(productForm.price),
                discount: Number(productForm.discount) || 0,
                stock: Number(productForm.stock),
                images: imageUrls.map(url => ({ url }))
            };

            if (isEditing) {
                await productAPI.update(editId, payload);
                showSuccess(isAr ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully');
            } else {
                await productAPI.create(payload);
                showSuccess(isAr ? 'تم إضافة المنتج بنجاح' : 'Product added successfully');
            }

            setShowProductForm(false);
            setIsEditing(false);
            setEditId(null);
            setProductForm(initialProductForm);
            setImageUrls([]);
            fetchAdminData();
        } catch (error) {
            console.error('Submit failed', error);
            showError(isAr ? 'فشل حفظ المنتج' : 'Failed to save product');
        }
    };

    const handleEdit = (p) => {
        setProductForm({
            nameEn: p.nameEn,
            nameAr: p.nameAr,
            price: p.price,
            discount: p.discount || 0,
            descriptionEn: p.descriptionEn,
            descriptionAr: p.descriptionAr,
            brand: p.brand,
            stock: p.stock,
            category: p.category?._id || p.category || 'sunglasses',
            warrantyAr: p.warrantyAr || '',
            warrantyEn: p.warrantyEn || ''
        });
        setImageUrls(p.images?.map(img => img.url) || []);
        setEditId(p._id);
        setIsEditing(true);
        setShowProductForm(true);
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm(
            isAr ? 'حذف المنتج' : 'Delete Product',
            isAr ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?',
            isAr
        );
        if (!confirmed) return;
        try {
            await productAPI.delete(id);
            fetchAdminData();
            showSuccess(isAr ? 'تم حذف المنتج' : 'Product deleted');
        } catch (err) {
            console.error('Delete failed', err);
            showError(isAr ? 'فشل الحذف' : 'Delete failed');
        }
    };

    const handleAgentSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/delivery', agentForm);
            setShowAgentForm(false);
            setAgentForm({ name: '', email: '', password: '' });
            fetchAdminData();
            showSuccess(isAr ? 'تم إضافة عامل الشحن بنجاح' : 'Delivery agent added');
        } catch (error) {
            console.error(error);
            showError(isAr ? 'فشل الإضافة' : 'Error adding delivery agent');
        }
    };

    const handleAssistantSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/assistant', agentForm);
            setShowAgentForm(false);
            setAgentForm({ name: '', email: '', password: '' });
            fetchAdminData();
            showSuccess(isAr ? 'تم إضافة المساعد بنجاح' : 'Assistant added');
        } catch (error) {
            console.error(error);
            showError(isAr ? 'فشل الإضافة' : 'Error adding assistant');
        }
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/admin', adminForm);
            setShowAdminForm(false);
            setAdminForm({ name: '', email: '', password: '' });
            fetchAdminData();
            showSuccess(isAr ? 'تم إضافة المدير بنجاح' : 'Admin added');
        } catch (error) {
            console.error(error);
            showError(isAr ? 'فشل الإضافة' : 'Error adding admin');
        }
    };

    const handleAdminPasswordChange = async (adminId) => {
        const newPassword = await showPasswordPrompt(isAr ? 'أدخل كلمة المرور الجديدة' : 'Enter new password', isAr);
        if (!newPassword || newPassword.trim() === '') return;

        try {
            await api.put(`/users/${adminId}/password`, { password: newPassword });
            showSuccess(isAr ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
        } catch (error) {
            console.error(error);
            showError(isAr ? 'خطأ في تغيير كلمة المرور' : 'Error changing password');
        }
    };

    const handleDeleteUser = async (userId, roleStr) => {
        const confirmed = await showConfirm(
            isAr ? `حذف ${roleStr}` : `Delete ${roleStr}`,
            isAr ? 'هل أنت متأكد من حذف هذا الحساب؟ هذه العملية لا يمكن التراجع عنها.' : 'Are you sure you want to delete this account? This action cannot be undone.',
            isAr
        );
        if (!confirmed) return;

        try {
            await api.delete(`/users/${userId}`);
            showSuccess(isAr ? 'تم حذف الحساب بنجاح' : 'Account deleted successfully');
            fetchAdminData();
            if (selectedAgent === userId) {
                setSelectedAgent(null);
            }
        } catch (error) {
            console.error(error);
            showError(isAr ? 'خطأ أثناء حذف الحساب' : 'Error deleting account');
        }
    };

    const assignAgent = async (orderId, agentId) => {
        if (!agentId) return;
        try {
            await api.put(`/orders/${orderId}/assign`, { deliveryAgentId: agentId });
            fetchAdminData();
        } catch (error) {
            console.error(error);
            alert('Error assigning agent');
        }
    };

    const handleUpdateShippingCost = async (id, newCost) => {
        try {
            await api.put(`/governorates/${id}`, { shippingCost: Number(newCost) });
            fetchAdminData();
            // alert(isAr ? 'تم تحديث الشحن بنجاح' : 'Shipping cost updated');
        } catch (error) {
            console.error(error);
            alert(isAr ? 'خطأ في تحديث الشحن' : 'Error updating shipping cost');
        }
    };

    const handleUpdateFreeShippingThreshold = async () => {
        try {
            await settingsAPI.update({ freeShippingThreshold });
            showSuccess(isAr ? 'تم تحديث حد الشحن المجاني بنجاح' : 'Free shipping threshold updated successfully');
        } catch (error) {
            console.error(error);
            showError(isAr ? 'خطأ في تحديث حد الشحن المجاني' : 'Error updating free shipping threshold');
        }
    };

    const tabOptions = [
        { id: 'dashboard', label: isAr ? 'لوحة القيادة' : 'Dashboard', roles: ['admin'] },
        { id: 'orders', label: isAr ? 'الطلبات' : 'Orders', roles: ['admin', 'assistant'] },
        { id: 'products', label: isAr ? 'المنتجات' : 'Products', roles: ['admin', 'assistant'] },
        { id: 'categories', label: isAr ? 'الفئات' : 'Categories', roles: ['admin'] },
        { id: 'agents', label: isAr ? 'عمال الشحن' : 'Delivery Agents', roles: ['admin'] },
        { id: 'assistants', label: isAr ? 'المساعدين' : 'Assistants', roles: ['admin'] },
        { id: 'admins', label: isAr ? 'المديرين' : 'Admins', roles: ['admin'] },
        { id: 'shipping', label: isAr ? 'أسعار الشحن' : 'Shipping Rates', roles: ['admin'] },
        { id: 'coupons', label: isAr ? 'كودات الخصم' : 'Coupons', roles: ['admin'] },
    ].filter(tab => tab.roles.includes(user?.role));

    // Group orders by date (24 hours)
    const groupedOrders = orders.reduce((groups, order) => {
        const date = new Date(order.createdAt || Date.now());
        const dateStr = date.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (!groups[dateStr]) {
            groups[dateStr] = [];
        }
        groups[dateStr].push(order);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedOrders).sort((a, b) => {
        const dateA = new Date(groupedOrders[a][0].createdAt || Date.now());
        const dateB = new Date(groupedOrders[b][0].createdAt || Date.now());
        return dateB - dateA;
    });

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full max-w-7xl">
            <div className="flex justify-between items-center mb-10 pb-6 border-gray-100 border-b">
                <div>
                    <h1 className="mb-2 font-bold text-primary text-3xl">
                        {isAr ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
                    </h1>
                    <p className="text-gray-500">
                        {isAr ? 'مرحباً بك، تحكم كامل بالمتجر وفريق التوصيل.' : 'Welcome, full control of store and delivery team.'}
                    </p>
                </div>
            </div>

            <div className="flex gap-4 mb-8 pb-2 border-gray-100 border-b overflow-x-auto">
                {tabOptions.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`whitespace-nowrap px-6 py-3 font-bold rounded-t-xl transition-colors ${activeTab === tab.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'dashboard' && (
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-12">
                    <div className="flex items-center gap-6 bg-white shadow-sm p-6 border border-gray-50 rounded-2xl">
                        <div className="flex justify-center items-center bg-green-100 rounded-2xl w-16 h-16"><TrendingUp size={28} className="text-green-500" /></div>
                        <div>
                            <p className="mb-1 font-semibold text-gray-500 text-sm">{isAr ? 'إجمالي المبيعات' : 'Total Sales'}</p>
                            <h3 className="font-black text-primary text-3xl">{stats.totalSales.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 bg-white shadow-sm p-6 border border-gray-50 rounded-2xl">
                        <div className="flex justify-center items-center bg-blue-100 rounded-2xl w-16 h-16"><ShoppingCart size={28} className="text-blue-500" /></div>
                        <div>
                            <p className="mb-1 font-semibold text-gray-500 text-sm">{isAr ? 'الطلبات' : 'Orders'}</p>
                            <h3 className="font-black text-primary text-3xl">{stats.ordersCount}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 bg-white shadow-sm p-6 border border-gray-50 rounded-2xl">
                        <div className="flex justify-center items-center bg-purple-100 rounded-2xl w-16 h-16"><Package size={28} className="text-purple-500" /></div>
                        <div>
                            <p className="mb-1 font-semibold text-gray-500 text-sm">{isAr ? 'المنتجات' : 'Products'}</p>
                            <h3 className="font-black text-primary text-3xl">{stats.productsCount}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 bg-white shadow-sm p-6 border border-gray-50 rounded-2xl">
                        <div className="flex justify-center items-center bg-yellow-100 rounded-2xl w-16 h-16"><Truck size={28} className="text-accent" /></div>
                        <div>
                            <p className="mb-1 font-semibold text-gray-500 text-sm">{isAr ? 'عمال الشحن' : 'Delivery Agents'}</p>
                            <h3 className="font-black text-primary text-3xl">{deliveryAgents.length}</h3>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div>
                    <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden mb-6">
                        <div className="p-6 border-gray-100 border-b flex justify-between items-center">
                            <h2 className="font-bold text-primary text-xl">
                                {isAr ? 'إدارة الطلبات' : 'Orders Management'}
                            </h2>
                            <div className="flex gap-4 items-center">
                                <button
                                    onClick={selectAllOrders}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-sm rounded-xl font-bold shadow-sm transition-all"
                                >
                                    {isAr ? (selectedOrderIds.size === orders.length && orders.length > 0 ? 'إلغاء التحديد' : 'تحديد الكل') : (selectedOrderIds.size === orders.length && orders.length > 0 ? 'Deselect All' : 'Select All')}
                                </button>
                                {selectedOrderIds.size > 0 && (
                                    <button
                                        onClick={() => triggerPrint(orders.filter(o => selectedOrderIds.has(o._id)))}
                                        className="bg-accent hover:bg-secondary text-white px-4 py-2 text-sm rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
                                    >
                                        <Printer size={16} />
                                        {isAr ? 'طباعة المحدد' : 'Print Selected'} ({selectedOrderIds.size})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {sortedDates.map((dateStr) => (
                            <div key={dateStr} className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
                                <div className="p-4 bg-gray-50 border-gray-100 border-b flex justify-between items-center">
                                    <h3 className="font-bold text-gray-700 text-lg">{dateStr}</h3>
                                    <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
                                        {groupedOrders[dateStr].length} {isAr ? 'طلبات' : 'orders'}
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-max text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                                                <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'} w-10`}>
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent cursor-pointer"
                                                        checked={groupedOrders[dateStr].every(o => selectedOrderIds.has(o._id))}
                                                        onChange={(e) => {
                                                            const newSet = new Set(selectedOrderIds);
                                                            if (e.target.checked) {
                                                                groupedOrders[dateStr].forEach(o => newSet.add(o._id));
                                                            } else {
                                                                groupedOrders[dateStr].forEach(o => newSet.delete(o._id));
                                                            }
                                                            setSelectedOrderIds(newSet);
                                                        }}
                                                    />
                                                </th>
                                                <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'رقم الطلب' : 'Order ID'}</th>
                                                <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'العميل ' : 'Customer'}</th>
                                                <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'المنتجات' : 'Products'}</th>
                                                <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'المبلغ' : 'Amount'}</th>
                                                <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الحالة' : 'Status'}</th>
                                                <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'عامل الشحن' : 'Delivery Agent'}</th>
                                                <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {groupedOrders[dateStr].map((item) => (
                                                <tr key={item._id} className={`transition-colors flex-wrap ${selectedOrderIds.has(item._id) ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-gray-50'}`}>
                                                    <td className="p-4">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent cursor-pointer"
                                                            checked={selectedOrderIds.has(item._id)}
                                                            onChange={() => toggleOrderSelection(item._id)}
                                                        />
                                                    </td>
                                                    <td className="p-4 font-mono font-bold text-primary text-sm">{item._id}</td>
                                                    <td className="p-4 font-medium">{item.user?.name || 'Guest'}</td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-2">
                                                            {item.orderItems?.map(oi => (
                                                                <div key={oi._id || oi.product} className="flex items-center gap-2">
                                                                    <img src={oi.image} className="w-8 h-8 rounded shrink-0 object-cover" alt="" />
                                                                    <div className="text-xs">
                                                                        <p className="font-bold line-clamp-1 truncate w-32" title={isAr ? oi.nameAr : oi.nameEn}>{isAr ? oi.nameAr : oi.nameEn}</p>
                                                                        <p className="text-gray-500 font-medium">Qty: {oi.quantity}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-bold text-primary">{item.totalPrice.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase ${item.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                            item.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                                item.status === 'Shipped' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        {item.deliveryAgent ? (
                                                            <span className="font-bold text-green-600">{item.deliveryAgent.name}</span>
                                                        ) : (
                                                            user?.role === 'admin' ? (
                                                                <select
                                                                    className="p-1 border border-gray-300 rounded focus:ring-accent"
                                                                    onChange={(e) => assignAgent(item._id, e.target.value)}
                                                                    defaultValue=""
                                                                >
                                                                    <option value="" disabled>{isAr ? 'تعيين عامل شحن' : 'Assign Agent'}</option>
                                                                    {deliveryAgents.map(ag => (
                                                                        <option key={ag._id} value={ag._id}>{ag.name}</option>
                                                                    ))}
                                                                </select>
                                                            ) : <span className="text-gray-400">{isAr ? 'غير محدد' : 'Unassigned'}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button
                                                            onClick={() => triggerPrint([item])}
                                                            className="bg-accent hover:bg-secondary text-white p-2 text-sm rounded-lg font-bold shadow-md transition-all flex items-center gap-1 w-max ml-auto"
                                                        >
                                                            <Printer size={16} />
                                                            {isAr ? 'طباعة' : 'Print'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'products' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => {
                                setShowProductForm(!showProductForm);
                                if (showProductForm) {
                                    setIsEditing(false);
                                    setEditId(null);
                                    setProductForm(initialProductForm);
                                }
                            }}
                            className="flex items-center gap-2 bg-primary hover:bg-secondary shadow-md px-6 py-3 rounded-xl font-bold text-white transition-all"
                        >
                            <PlusCircle size={20} />
                            {isAr ? 'إضافة منتج' : 'Add Product'}
                        </button>
                    </div>

                    {showProductForm && (
                        <div className="bg-white shadow-xl mb-10 p-8 border border-gray-100 rounded-[2.5rem]">
                            <div className="flex justify-between items-center mb-8 pb-4 border-gray-50 border-b">
                                <h3 className="font-black text-primary text-2xl">
                                    {isEditing ? (isAr ? 'تعديل المنتج' : 'Edit Product') : (isAr ? 'إضافة منتج جديد' : 'New Product')}
                                </h3>
                                <button onClick={() => { setShowProductForm(false); setIsEditing(false); setProductForm(initialProductForm); }} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <X />
                                </button>
                            </div>


                            <form onSubmit={handleProductSubmit} className="gap-6 grid grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="font-bold text-primary text-sm uppercase tracking-widest">{isAr ? 'اسم المنتج (EN)' : 'Product Name (EN)'}</label>
                                    <input required name="nameEn" value={productForm.nameEn} placeholder="e.g. Luxury Aviator" className="bg-gray-50 p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent w-full transition-all" onChange={e => setProductForm({ ...productForm, nameEn: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-primary text-sm uppercase tracking-widest">{isAr ? 'اسم المنتج (عربي)' : 'Product Name (AR)'}</label>
                                    <input required name="nameAr" value={productForm.nameAr} placeholder="مثال: نظارة طيارين فاخرة" className="bg-gray-50 p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent w-full transition-all" onChange={e => setProductForm({ ...productForm, nameAr: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-primary text-sm uppercase tracking-widest">{isAr ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                                    <input required name="price" value={productForm.price} type="number" placeholder="0.00" className="bg-gray-50 p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent w-full transition-all" onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-primary text-sm uppercase tracking-widest">{isAr ? 'نسبة الخصم %' : 'Discount %'}</label>
                                    <input required name="discount" value={productForm.discount} type="number" min="0" max="99" placeholder="0" className="bg-gray-50 p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent w-full transition-all" onChange={e => setProductForm({ ...productForm, discount: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-primary text-sm uppercase tracking-widest">{isAr ? 'المخزون' : 'Stock'}</label>
                                    <input required name="stock" value={productForm.stock} type="number" placeholder="0" className="bg-gray-50 p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent w-full transition-all" onChange={e => setProductForm({ ...productForm, stock: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-primary text-sm uppercase tracking-widest">{isAr ? 'الماركة' : 'Brand'}</label>
                                    <input required name="brand" value={productForm.brand} placeholder="e.g. Ray-Ban" className="bg-gray-50 p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent w-full transition-all" onChange={e => setProductForm({ ...productForm, brand: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-primary text-sm uppercase tracking-widest">{isAr ? 'القسم' : 'Category'}</label>
                                    <select
                                        required
                                        name="category"
                                        value={productForm.category}
                                        className="bg-gray-50 p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent w-full transition-all"
                                        onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                                    >
                                        <option value="">{isAr ? 'اختر قسماً' : 'Select a category'}</option>
                                        {dbCategories.map(cat => (
                                            <option key={cat._id} value={cat._id}>
                                                {isAr ? cat.nameAr : cat.nameEn}
                                            </option>
                                        ))}
                                    </select>
                                </div>


                                <div className="space-y-2 md:col-span-2">
                                    <label className="font-bold text-primary text-sm uppercase tracking-widest">{isAr ? 'صور المنتج' : 'Product Images'}</label>
                                    <div className="flex md:flex-row flex-col gap-4">
                                        <div className="relative flex-grow">
                                            <input
                                                type="file"
                                                id="file-upload"
                                                className="hidden"
                                                accept="image/*"
                                                multiple
                                                onChange={handleFileUpload}
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className={`flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl font-bold cursor-pointer border-2 border-dashed transition-all ${uploading ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-gray-50 text-primary border-gray-300 hover:border-accent hover:bg-gray-100'}`}
                                            >
                                                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                                                {isAr ? 'اختر صور لرفعها (يمكن اختيار متعدد)' : 'Choose images to upload (multiple allowed)'}
                                            </label>
                                        </div>
                                    </div>

                                    {imageUrls.length > 0 && (
                                        <div className="flex flex-wrap gap-4 mt-6">
                                            {imageUrls.map((url, index) => (
                                                <div key={index} className="group relative shadow-sm border border-gray-100 rounded-xl w-32 h-32 overflow-hidden">
                                                    <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="top-1 right-1 absolute bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 shadow-md p-1.5 rounded-lg text-white transition-opacity"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="font-bold text-primary text-sm uppercase tracking-widest">{isAr ? 'الوصف (EN)' : 'Description (EN)'}</label>
                                    <textarea name="descriptionEn" value={productForm.descriptionEn} rows="4" className="bg-gray-50 p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent w-full transition-all resize-none" onChange={e => setProductForm({ ...productForm, descriptionEn: e.target.value })}></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-primary text-sm uppercase tracking-widest">{isAr ? 'الوصف (عربي)' : 'Description (AR)'}</label>
                                    <textarea name="descriptionAr" value={productForm.descriptionAr} rows="4" className="bg-gray-50 p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent w-full transition-all resize-none" onChange={e => setProductForm({ ...productForm, descriptionAr: e.target.value })}></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-primary text-sm uppercase tracking-widest">{isAr ? 'الضمان (EN) (اختياري)' : 'Warranty (EN) (Optional)'}</label>
                                    <input name="warrantyEn" value={productForm.warrantyEn} placeholder="e.g. 2 Years Warranty" className="bg-gray-50 p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent w-full transition-all" onChange={e => setProductForm({ ...productForm, warrantyEn: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-primary text-sm uppercase tracking-widest">{isAr ? 'الضمان (عربي) (اختياري)' : 'Warranty (AR) (Optional)'}</label>
                                    <input name="warrantyAr" value={productForm.warrantyAr} placeholder="مثال: ضمان عامين" className="bg-gray-50 p-4 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-accent w-full transition-all" onChange={e => setProductForm({ ...productForm, warrantyAr: e.target.value })} />
                                </div>


                                <button type="submit" disabled={uploading} className="md:col-span-2 bg-accent shadow-accent/20 shadow-xl hover:shadow-accent/40 mt-4 py-5 rounded-2xl font-black text-white text-xl active:scale-95 transition-all">
                                    {isEditing ? (isAr ? 'تحديث المنتج' : 'Update Product') : (isAr ? 'حفظ المنتج الجديد' : 'Save Product')}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="gap-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map(p => (
                            <div key={p._id} className="group relative flex flex-col bg-white shadow-sm hover:shadow-xl border border-gray-100 rounded-3xl overflow-hidden transition-all duration-500">
                                <div className="relative bg-gray-50 h-48 overflow-hidden">
                                    <img src={p.images?.[0]?.url || 'https://via.placeholder.com/150'} alt="product" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    {p.freeShipping && (
                                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 px-2 py-1 rounded-full text-white font-black text-[9px] shadow-lg">
                                            <Truck size={9} /> {isAr ? 'شحن مجاني' : 'Free Ship'}
                                        </div>
                                    )}
                                    <div className="top-2 right-2 absolute flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(p)} className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm p-2 rounded-xl text-primary transition-all">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(p._id)} className="bg-white/90 hover:bg-red-500 shadow-lg backdrop-blur-sm p-2 rounded-xl text-red-500 hover:text-white transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col flex-grow p-5">
                                    <p className="mb-1 font-black text-[10px] text-gray-400 uppercase tracking-widest">{p.brand}</p>
                                    <h4 className="mb-2 font-bold text-primary text-lg line-clamp-1">{isAr ? p.nameAr : p.nameEn}</h4>
                                    <div className="flex justify-between items-center mt-auto pt-4 border-gray-50 border-t">
                                        <span className="font-black text-primary text-xl">{p.price} {isAr ? 'ج.م' : 'EGP'}</span>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${p.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {isAr ? 'مخزون: ' : 'Stock: '} {p.stock}
                                        </span>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            await productAPI.update(p._id, { freeShipping: !p.freeShipping });
                                            fetchAdminData();
                                        }}
                                        className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs transition-all ${p.freeShipping ? 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-500' : 'bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600'}`}
                                    >
                                        <Truck size={13} />
                                        {p.freeShipping ? (isAr ? 'إلغاء الشحن المجاني' : 'Remove Free Shipping') : (isAr ? 'تفعيل شحن مجاني' : 'Set Free Shipping')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'agents' && (
                <div>
                    <button
                        onClick={() => setShowAgentForm(!showAgentForm)}
                        className="flex items-center gap-2 bg-primary hover:bg-secondary shadow-md mb-6 px-6 py-3 rounded-xl font-bold text-white transition-all"
                    >
                        <PlusCircle size={20} />
                        {isAr ? 'إضافة عامل شحن' : 'Add Delivery Agent'}
                    </button>

                    {showAgentForm && (
                        <form onSubmit={handleAgentSubmit} className="gap-4 grid grid-cols-1 md:grid-cols-2 bg-gray-50 mb-8 p-6 border border-gray-200 rounded-2xl">
                            <input required name="name" placeholder="Full Name" className="p-3 border rounded-lg" onChange={e => setAgentForm({ ...agentForm, name: e.target.value })} />
                            <input required name="email" type="email" placeholder="Email Address" className="p-3 border rounded-lg" onChange={e => setAgentForm({ ...agentForm, email: e.target.value })} />
                            <input required name="password" type="password" placeholder="Password" className="p-3 border rounded-lg" onChange={e => setAgentForm({ ...agentForm, password: e.target.value })} />
                            <button type="submit" className="col-span-1 md:col-span-2 bg-accent p-3 rounded-lg font-bold text-white">
                                {isAr ? 'تأكيد حساب الشحن' : 'Create Agent Account'}
                            </button>
                        </form>
                    )}

                    <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                                    <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الاسم' : 'Name'}</th>
                                    <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                                    <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {deliveryAgents.map((ag) => (
                                    <React.Fragment key={ag._id}>
                                        <tr
                                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedAgent === ag._id ? 'bg-gray-50' : ''}`}
                                            onClick={() => setSelectedAgent(selectedAgent === ag._id ? null : ag._id)}
                                        >
                                            <td className="p-4 font-bold text-primary">{ag.name}</td>
                                            <td className="p-4 text-gray-500">{ag.email}</td>
                                            <td className={`p-4 font-semibold ${isAr ? 'text-left' : 'text-right'}`}>
                                                <div className="flex justify-end gap-3">
                                                    <button className="text-accent hover:underline text-sm font-bold">
                                                        {isAr ? 'عرض الطلبات' : 'View Orders'}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteUser(ag._id, isAr ? 'المندوب' : 'Agent');
                                                        }}
                                                        className="text-red-500 hover:text-red-700 hover:underline text-sm font-bold transition-colors"
                                                    >
                                                        {isAr ? 'حذف' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {selectedAgent === ag._id && (
                                            <tr>
                                                <td colSpan="3" className="p-4 bg-gray-50 border-t border-gray-100">
                                                    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                                        <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                                                            <Package size={20} className="text-accent" />
                                                            {isAr ? 'طلبات المندوب:' : 'Agent Orders:'} {ag.name}
                                                        </h4>
                                                        {orders.filter(o => o.deliveryAgent?._id === ag._id || o.deliveryAgent === ag._id).length > 0 ? (
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-left border-collapse text-sm">
                                                                    <thead>
                                                                        <tr className="text-gray-500 border-b border-gray-100">
                                                                            <th className={`pb-3 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'رقم الطلب' : 'Order ID'}</th>
                                                                            <th className={`pb-3 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'العميل' : 'Customer'}</th>
                                                                            <th className={`pb-3 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'المنتجات' : 'Products'}</th>
                                                                            <th className={`pb-3 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'المبلغ' : 'Amount'}</th>
                                                                            <th className={`pb-3 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الحالة' : 'Status'}</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {orders.filter(o => o.deliveryAgent?._id === ag._id || o.deliveryAgent === ag._id).map(o => (
                                                                            <tr key={o._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                                                                <td className="py-3 font-mono text-xs text-primary font-bold">{o._id}</td>
                                                                                <td className="py-3 font-medium">{o.user?.name || 'Guest'}</td>
                                                                                <td className="py-3">
                                                                                    <div className="flex flex-col gap-1">
                                                                                        {o.orderItems?.map(oi => (
                                                                                            <span key={oi._id || oi.product} className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                                                                                                {oi.quantity}x {isAr ? oi.nameAr : oi.nameEn}
                                                                                            </span>
                                                                                        ))}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="py-3 font-bold text-primary">{o.totalPrice.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</td>
                                                                                <td className="py-3">
                                                                                    <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase ${o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                                        o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                                            o.status === 'Shipped' ? 'bg-yellow-100 text-yellow-700' :
                                                                                                'bg-blue-100 text-blue-700'
                                                                                        }`}>
                                                                                        {o.status}
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                                                                <Package size={40} className="mb-2 opacity-50" />
                                                                <p className="text-sm font-medium">
                                                                    {isAr ? 'لا يوجد طلبات مسندة لهذا المندوب حالياً.' : 'No orders assigned to this agent currently.'}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            {/* Hidden Invoice Template for Printing */}
            <div className="hidden">
                <PrintableInvoice ref={componentRef} orders={ordersToPrint} />
            </div>

            {
                activeTab === 'assistants' && (
                    <div>
                        <button
                            onClick={() => setShowAgentForm(!showAgentForm)}
                            className="flex items-center gap-2 bg-primary hover:bg-secondary shadow-md mb-6 px-6 py-3 rounded-xl font-bold text-white transition-all"
                        >
                            <PlusCircle size={20} />
                            {isAr ? 'إضافة مساعد' : 'Add Assistant'}
                        </button>

                        {showAgentForm && (
                            <form onSubmit={handleAssistantSubmit} className="gap-4 grid grid-cols-1 md:grid-cols-2 bg-gray-50 mb-8 p-6 border border-gray-200 rounded-2xl">
                                <input required name="name" value={agentForm.name} placeholder={isAr ? 'الاسم بالكامل' : 'Full Name'} className="p-3 border rounded-lg focus:ring-accent" onChange={e => setAgentForm({ ...agentForm, name: e.target.value })} />
                                <input required name="email" value={agentForm.email} type="email" placeholder={isAr ? 'البريد الإلكتروني' : 'Email Address'} className="p-3 border rounded-lg focus:ring-accent" onChange={e => setAgentForm({ ...agentForm, email: e.target.value })} />
                                <input required name="password" value={agentForm.password} type="password" placeholder={isAr ? 'الرقم السري' : 'Password'} className="p-3 border rounded-lg focus:ring-accent" onChange={e => setAgentForm({ ...agentForm, password: e.target.value })} />
                                <button type="submit" className="col-span-1 md:col-span-2 bg-accent shadow-accent/20 shadow-lg hover:shadow-xl p-3 rounded-lg font-bold text-white transition-all active:scale-95">
                                    {isAr ? 'تأكيد الحساب المساعد' : 'Create Assistant Account'}
                                </button>
                            </form>
                        )}

                        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                                        <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الاسم' : 'Name'}</th>
                                        <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                                        <th className={`p-4 font-semibold text-center`}>{isAr ? 'إجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {assistants.map((ast) => (
                                        <tr key={ast._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-bold text-primary">{ast.name}</td>
                                            <td className="p-4 text-gray-500">{ast.email}</td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => handleDeleteUser(ast._id, isAr ? 'المساعد' : 'Assistant')}
                                                    className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                                                >
                                                    {isAr ? 'حذف الحساب' : 'Delete Account'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'admins' && (
                    <div>
                        <button
                            onClick={() => setShowAdminForm(!showAdminForm)}
                            className="flex items-center gap-2 bg-primary hover:bg-secondary shadow-md mb-6 px-6 py-3 rounded-xl font-bold text-white transition-all"
                        >
                            <PlusCircle size={20} />
                            {isAr ? 'إضافة مدير' : 'Add Admin'}
                        </button>

                        {showAdminForm && (
                            <form onSubmit={handleAdminSubmit} className="gap-4 grid grid-cols-1 md:grid-cols-2 bg-gray-50 mb-8 p-6 border border-gray-200 rounded-2xl">
                                <input required name="name" value={adminForm.name} placeholder={isAr ? 'الاسم بالكامل' : 'Full Name'} className="p-3 border rounded-lg focus:ring-accent" onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} />
                                <input required name="email" value={adminForm.email} type="email" placeholder={isAr ? 'البريد الإلكتروني' : 'Email Address'} className="p-3 border rounded-lg focus:ring-accent" onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} />
                                <input required name="password" value={adminForm.password} type="password" placeholder={isAr ? 'الرقم السري' : 'Password'} className="p-3 border rounded-lg focus:ring-accent" onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} />
                                <button type="submit" className="col-span-1 md:col-span-2 bg-accent shadow-accent/20 shadow-lg hover:shadow-xl p-3 rounded-lg font-bold text-white transition-all active:scale-95">
                                    {isAr ? 'تأكيد حساب المدير' : 'Create Admin Account'}
                                </button>
                            </form>
                        )}

                        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                                        <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'الاسم' : 'Name'}</th>
                                        <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                                        <th className={`p-4 font-semibold text-center`}>{isAr ? 'إجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {admins.map((adm) => (
                                        <tr key={adm._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-bold text-primary">{adm.name}</td>
                                            <td className="p-4 text-gray-500">{adm.email}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleAdminPasswordChange(adm._id)}
                                                        className="bg-accent hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                                                    >
                                                        {isAr ? 'تغيير الرقم السري' : 'Change Password'}
                                                    </button>
                                                    {user._id !== adm._id && (
                                                        <button
                                                            onClick={() => handleDeleteUser(adm._id, isAr ? 'المدير' : 'Admin')}
                                                            className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                                                        >
                                                            {isAr ? 'حذف' : 'Delete'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {activeTab === 'shipping' && (
                <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden p-6 md:p-8">
                    <div className="mb-6 border-b border-gray-100 pb-6">
                        <h2 className="font-bold text-primary text-2xl">{isAr ? 'حد الشحن المجاني التلقائي' : 'Automatic Free Shipping Threshold'}</h2>
                        <p className="text-gray-500 mt-2 text-sm">{isAr ? 'أي طلب يتجاوز أو يساوي هذا المبلغ يحصل على شحن مجاني تلقائياً.' : 'Any order greater than or equal to this amount gets free automatic shipping.'}</p>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="relative">
                                <span className={`absolute top-1/2 -translate-y-1/2 text-gray-400 font-bold ${isAr ? 'left-4' : 'right-4'}`}>{isAr ? 'ج.م' : 'EGP'}</span>
                                <input
                                    type="number"
                                    value={freeShippingThreshold}
                                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                                    className={`p-3 border border-gray-200 rounded-xl focus:ring-accent outline-none font-bold text-primary w-40 ${isAr ? 'pr-4 pl-12' : 'pl-4 pr-12'}`}
                                    min="0"
                                />
                            </div>
                            <button
                                onClick={handleUpdateFreeShippingThreshold}
                                className="bg-accent hover:bg-secondary text-white px-6 py-3 rounded-xl font-bold shadow transition-all"
                            >
                                {isAr ? 'حفظ حد الشحن' : 'Save Threshold'}
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="font-bold text-primary text-2xl">{isAr ? 'أسعار الشحن للمحافظات' : 'Shipping Rates by Governorate'}</h2>
                        <p className="text-gray-500 mt-2 text-sm">{isAr ? 'حدد تكلفة الشحن الأساسية لكل محافظة لتطبيقها على الطلبات العادية.' : 'Set the base shipping cost for each governorate to apply to normal orders.'}</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                                    <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'المحافظة' : 'Governorate'}</th>
                                    <th className={`p-4 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>{isAr ? 'سعر الشحن (ج.م)' : 'Shipping Cost (EGP)'}</th>
                                    <th className={`p-4 font-semibold text-center`}>{isAr ? 'تعديل السعر' : 'Update Price'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {governorates.map((gov) => (
                                    <tr key={gov._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-bold text-primary">
                                            {isAr ? gov.nameAr : gov.nameEn}
                                        </td>
                                        <td className="p-4 text-gray-800 font-bold">
                                            {gov.shippingCost} {isAr ? 'ج.م' : 'EGP'}
                                        </td>
                                        <td className="p-4 flex gap-2 items-center justify-center">
                                            <input
                                                type="number"
                                                defaultValue={gov.shippingCost}
                                                onChange={(e) => setShippingDrafts({ ...shippingDrafts, [gov._id]: e.target.value })}
                                                className="w-24 p-2 border border-gray-300 rounded focus:ring-accent outline-none text-center"
                                                min="0"
                                            />
                                            <button
                                                onClick={() => handleUpdateShippingCost(gov._id, shippingDrafts[gov._id] ?? gov.shippingCost)}
                                                className="bg-accent hover:bg-secondary text-white px-4 py-2 rounded-lg font-bold text-sm shadow transition-all"
                                            >
                                                {isAr ? 'حفظ' : 'Save'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'coupons' && (
                <div className="space-y-6">
                    <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="font-bold text-primary text-2xl flex items-center gap-2"><Tag size={22} className="text-accent" />{isAr ? 'كودات الخصم' : 'Discount Coupons'}</h2>
                                <p className="text-gray-500 mt-1 text-sm">{isAr ? 'أنشئ كودات خصم مخصصة للعملاء.' : 'Create and manage custom discount codes for your customers.'}</p>
                            </div>
                            <button
                                onClick={() => setShowCouponForm(!showCouponForm)}
                                className="flex items-center gap-2 bg-primary hover:bg-secondary text-white px-5 py-3 rounded-xl font-bold shadow transition-all"
                            >
                                <PlusCircle size={18} />
                                {isAr ? 'كود جديد' : 'New Coupon'}
                            </button>
                        </div>

                        {showCouponForm && (
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await api.post('/coupons', couponForm);
                                        setCouponForm({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', maxUses: '', expiryDate: '' });
                                        setShowCouponForm(false);
                                        fetchAdminData();
                                    } catch (err) {
                                        showError(err.response?.data?.message || (isAr ? 'خطأ في إنشاء الكود' : 'Error creating coupon'));
                                    }
                                }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6"
                            >
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isAr ? 'كود الخصم' : 'Coupon Code'}</label>
                                    <input required value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="SAVE20" className="w-full p-3 border border-gray-200 rounded-xl font-mono font-bold text-primary uppercase bg-white focus:outline-none focus:ring-2 focus:ring-accent" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isAr ? 'نوع الخصم' : 'Discount Type'}</label>
                                    <select value={couponForm.discountType} onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-accent font-bold">
                                        <option value="percentage">{isAr ? 'نسبة مئوية %' : 'Percentage %'}</option>
                                        <option value="fixed">{isAr ? 'مبلغ ثابت ج.م' : 'Fixed Amount EGP'}</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{couponForm.discountType === 'percentage' ? (isAr ? 'نسبة الخصم %' : 'Discount %') : (isAr ? 'قيمة الخصم ج.م' : 'Discount Amount EGP')}</label>
                                    <input required type="number" min="1" value={couponForm.discountValue} onChange={e => setCouponForm({ ...couponForm, discountValue: e.target.value })} placeholder={couponForm.discountType === 'percentage' ? '20' : '50'} className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-accent font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isAr ? 'حد أدنى للطلب ج.م' : 'Min Order EGP'}</label>
                                    <input type="number" min="0" value={couponForm.minOrderValue} onChange={e => setCouponForm({ ...couponForm, minOrderValue: e.target.value })} placeholder="0" className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-accent" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isAr ? 'عدد الاستخدام (0 = لا محدود)' : 'Max Uses (0 = unlimited)'}</label>
                                    <input type="number" min="0" value={couponForm.maxUses} onChange={e => setCouponForm({ ...couponForm, maxUses: e.target.value })} placeholder="0" className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-accent" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isAr ? 'تاريخ الانتهاء' : 'Expiry Date'}</label>
                                    <input type="date" value={couponForm.expiryDate} onChange={e => setCouponForm({ ...couponForm, expiryDate: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-accent" />
                                </div>
                                <div className="sm:col-span-2 lg:col-span-3 flex gap-3 justify-end">
                                    <button type="button" onClick={() => setShowCouponForm(false)} className="px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition">{isAr ? 'إلغاء' : 'Cancel'}</button>
                                    <button type="submit" className="px-8 py-3 bg-accent hover:bg-orange-600 text-white rounded-xl font-bold shadow transition">{isAr ? 'حفظ الكود' : 'Save Coupon'}</button>
                                </div>
                            </form>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-semibold">{isAr ? 'الكود' : 'Code'}</th>
                                        <th className="p-4 font-semibold">{isAr ? 'الخصم' : 'Discount'}</th>
                                        <th className="p-4 font-semibold">{isAr ? 'حد الطلب' : 'Min Order'}</th>
                                        <th className="p-4 font-semibold">{isAr ? 'الاستخدام' : 'Uses'}</th>
                                        <th className="p-4 font-semibold">{isAr ? 'الانتهاء' : 'Expiry'}</th>
                                        <th className="p-4 font-semibold text-center">{isAr ? 'الحالة' : 'Status'}</th>
                                        <th className="p-4 font-semibold text-center">{isAr ? 'حذف' : 'Delete'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {coupons.length === 0 && (
                                        <tr><td colSpan="7" className="p-8 text-center text-gray-400 font-medium">{isAr ? 'لا توجد كودات خصم حتى الآن.' : 'No coupons yet.'}</td></tr>
                                    )}
                                    {coupons.map(c => (
                                        <tr key={c._id} className={`hover:bg-gray-50 transition-colors ${!c.isActive ? 'opacity-50' : ''}`}>
                                            <td className="p-4">
                                                <span className="font-mono font-black text-primary bg-primary/10 px-3 py-1 rounded-lg text-sm">{c.code}</span>
                                            </td>
                                            <td className="p-4 font-bold text-accent">
                                                {c.discountType === 'percentage' ? `${c.discountValue}%` : `${c.discountValue} ج.م`}
                                            </td>
                                            <td className="p-4 text-gray-500 font-medium">{c.minOrderValue > 0 ? `${c.minOrderValue} ج.م` : '—'}</td>
                                            <td className="p-4 text-gray-500">{c.usedCount} {c.maxUses > 0 ? `/ ${c.maxUses}` : ''}</td>
                                            <td className="p-4 text-gray-500 text-sm">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '—'}</td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={async () => { await api.put(`/coupons/${c._id}`, { isActive: !c.isActive }); fetchAdminData(); }}
                                                    className={`transition-colors ${c.isActive ? 'text-green-500 hover:text-green-700' : 'text-gray-300 hover:text-gray-500'}`}
                                                    title={c.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {c.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                                </button>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={async () => {
                                                        const confirmed = await showConfirm(isAr ? 'حذف الكود' : 'Delete Coupon', isAr ? 'حذف هذا الكود؟' : 'Delete this coupon?', isAr);
                                                        if (confirmed) {
                                                            await api.delete(`/coupons/${c._id}`);
                                                            fetchAdminData();
                                                            showSuccess(isAr ? 'تم حذف الكود' : 'Coupon deleted');
                                                        }
                                                    }}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="space-y-6">
                    <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="font-bold text-primary text-2xl">{isAr ? 'إدارة الفئات' : 'Manage Categories'}</h2>
                                <p className="text-gray-400 text-sm mt-1">{isAr ? 'أضف وعدّل فئات المنتجات مع صورها.' : 'Add and edit product categories with images.'}</p>
                            </div>
                            <button
                                onClick={() => { setShowCatForm(!showCatForm); setEditingCat(null); setCategoryForm({ nameEn: '', nameAr: '', image: '' }); }}
                                className="flex items-center gap-2 bg-primary hover:bg-secondary text-white px-5 py-3 rounded-xl font-bold shadow transition-all"
                            >
                                <PlusCircle size={18} />
                                {isAr ? 'فئة جديدة' : 'New Category'}
                            </button>
                        </div>

                        {showCatForm && (
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        if (editingCat) {
                                            await api.put(`/categories/${editingCat._id}`, categoryForm);
                                        } else {
                                            await api.post('/categories', categoryForm);
                                        }
                                        setCategoryForm({ nameEn: '', nameAr: '', image: '' });
                                        setShowCatForm(false);
                                        setEditingCat(null);
                                        fetchAdminData();
                                        showSuccess(isAr ? 'تم حفظ التعديلات' : 'Changes saved successfully');
                                    } catch (err) {
                                        showError(err.response?.data?.message || 'Error');
                                    }
                                }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6"
                            >
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isAr ? 'الاسم بالعربية' : 'Name (Arabic)'}</label>
                                    <input required value={categoryForm.nameAr} onChange={e => setCategoryForm({ ...categoryForm, nameAr: e.target.value })} placeholder="نظارات شمسية" className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-accent font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isAr ? 'الاسم بالإنجليزية' : 'Name (English)'}</label>
                                    <input required value={categoryForm.nameEn} onChange={e => setCategoryForm({ ...categoryForm, nameEn: e.target.value })} placeholder="Sunglasses" className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-accent font-bold" />
                                </div>
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isAr ? 'صورة الفئة' : 'Category Image'}</label>
                                    <div className="flex gap-3 items-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="cat-img-upload"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                setCatImgUploading(true);
                                                try {
                                                    const fd = new FormData();
                                                    fd.append('image', file);
                                                    const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                    setCategoryForm(prev => ({ ...prev, image: res.data.url }));
                                                    showSuccess(isAr ? 'تم رفع الصورة نجاح' : 'Image uploaded successfully');
                                                } catch { showError(isAr ? 'فشل رفع الصورة' : 'Image upload failed'); }
                                                finally { setCatImgUploading(false); }
                                            }}
                                        />
                                        <label htmlFor="cat-img-upload" className="flex items-center gap-2 cursor-pointer bg-white border-2 border-dashed border-gray-200 hover:border-accent px-5 py-3 rounded-xl font-bold text-gray-500 hover:text-accent transition-all">
                                            <Upload size={16} />
                                            {catImgUploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع صورة' : 'Upload Image')}
                                        </label>
                                        {categoryForm.image && <img src={categoryForm.image} alt="preview" className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow" />}
                                    </div>
                                    <input value={categoryForm.image} onChange={e => setCategoryForm({ ...categoryForm, image: e.target.value })} placeholder={isAr ? 'أو أدخل رابط الصورة مباشرة...' : 'Or paste image URL...'} className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-accent text-sm text-gray-500" />
                                </div>
                                <div className="sm:col-span-2 flex gap-3 justify-end">
                                    <button type="button" onClick={() => { setShowCatForm(false); setEditingCat(null); }} className="px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition">{isAr ? 'إلغاء' : 'Cancel'}</button>
                                    <button type="submit" className="px-8 py-3 bg-accent hover:bg-orange-600 text-white rounded-xl font-bold shadow transition">{editingCat ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة الفئة' : 'Add Category')}</button>
                                </div>
                            </form>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {dbCategories.length === 0 && <p className="col-span-4 text-center text-gray-400 py-10">{isAr ? 'لا توجد فئات.' : 'No categories yet.'}</p>}
                            {dbCategories.map(cat => (
                                <div key={cat._id} className="group relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                                    <div className="h-40 bg-gray-100 overflow-hidden">
                                        {cat.image
                                            ? <img src={cat.image} alt={cat.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl">📁</div>
                                        }
                                    </div>
                                    <div className="p-4">
                                        <p className="font-black text-primary">{isAr ? cat.nameAr : cat.nameEn}</p>
                                        <p className="text-gray-400 text-sm">{isAr ? cat.nameEn : cat.nameAr}</p>
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => { setEditingCat(cat); setCategoryForm({ nameEn: cat.nameEn, nameAr: cat.nameAr, image: cat.image || '' }); setShowCatForm(true); }}
                                                className="flex-1 flex items-center justify-center gap-1 bg-gray-50 hover:bg-primary hover:text-white py-2 rounded-lg font-bold text-sm text-primary transition-all"
                                            >
                                                <Edit size={14} /> {isAr ? 'تعديل' : 'Edit'}
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const confirmed = await showConfirm(isAr ? 'حذف الفئة' : 'Delete Category', isAr ? 'حذف هذه الفئة؟' : 'Delete this category?', isAr);
                                                    if (confirmed) {
                                                        await api.delete(`/categories/${cat._id}`);
                                                        fetchAdminData();
                                                        showSuccess(isAr ? 'تم حذف الفئة' : 'Category deleted');
                                                    }
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-500 hover:text-white py-2 rounded-lg font-bold text-sm text-red-500 transition-all"
                                            >
                                                <Trash2 size={14} /> {isAr ? 'حذف' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default AdminDashboard;
