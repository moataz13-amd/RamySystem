import React, { forwardRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/icon_1.svg';

const PrintableInvoice = forwardRef(({ orders }, ref) => {
    const { currentLanguage } = useLanguage();
    const isAr = currentLanguage === 'ar';

    if (!orders || orders.length === 0) return null;

    return (
        <div ref={ref} className="print:bg-white">
            {orders.map((order, idx) => (
                <div key={order._id} dir={isAr ? 'rtl' : 'ltr'} className={`bg-white p-8 w-full max-w-4xl mx-auto rounded-xl print:text-black ${idx !== orders.length - 1 ? 'print:break-after-page' : ''}`}>
                    <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-gray-200">
                        <div className="flex items-center gap-4">
                            <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
                            <div>
                                <h1 className="font-extrabold text-2xl uppercase tracking-widest text-primary">
                                    {isAr ? 'رامي المغربي للبصريات' : 'Ramy Elmaghraby Optics'}
                                </h1>
                                <p className="text-gray-500 font-medium">
                                    {isAr ? 'فاتورة طلب' : 'Order Invoice'}
                                </p>
                            </div>
                        </div>
                        <div className="text-end">
                            <h2 className="text-gray-400 font-bold uppercase tracking-wider mb-2">
                                {isAr ? 'رقم الفاتورة' : 'Invoice No.'}
                            </h2>
                            <p className="font-mono text-xl font-black text-gray-800">{order._id.substring(0, 8).toUpperCase()}</p>
                            <p className="text-sm text-gray-500 mt-2">
                                {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                        <div>
                            <h3 className="font-bold text-gray-400 uppercase tracking-widest mb-4">
                                {isAr ? 'تفاصيل العميل' : 'Customer Details'}
                            </h3>
                            <div className="space-y-2">
                                <p className="font-bold text-lg">{order.user?.name || 'Guest'}</p>
                                <p className="text-gray-600">{order.user?.email}</p>
                                <p className="text-gray-600 font-mono font-medium">{order.shippingAddress?.phone}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-400 uppercase tracking-widest mb-4">
                                {isAr ? 'عنوان التوصيل' : 'Shipping Address'}
                            </h3>
                            <div className="space-y-2">
                                <p className="text-gray-800 leading-relaxed">{order.shippingAddress?.address}</p>
                                <p className="text-gray-600">{order.shippingAddress?.city}</p>
                                {order.shippingAddress?.notes && (
                                    <p className="text-sm text-gray-500 italic mt-3 border-l-2 pl-3 border-gray-300">
                                        {isAr ? 'ملاحظات: ' : 'Notes: '} {order.shippingAddress.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <table className="w-full text-start border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b-2 border-gray-200 text-gray-600 uppercase tracking-wider text-sm">
                                    <th className="py-4 px-4 font-bold">{isAr ? 'المنتج' : 'Item'}</th>
                                    <th className="py-4 px-4 font-bold text-center">{isAr ? 'الكمية' : 'Qty'}</th>
                                    <th className="py-4 px-4 font-bold text-end">{isAr ? 'السعر' : 'Price'}</th>
                                    <th className="py-4 px-4 font-bold text-end">{isAr ? 'الإجمالي' : 'Total'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.orderItems?.map((item, index) => (
                                    <tr key={index} className="group">
                                        <td className="py-4 px-4 font-bold text-gray-800">{isAr ? item.nameAr : item.nameEn} {item.selectedColor && <span className="text-gray-400 text-sm ml-2">({item.selectedColor})</span>}</td>
                                        <td className="py-4 px-4 text-center font-bold text-gray-600">{item.quantity}</td>
                                        <td className="py-4 px-4 text-end font-medium text-gray-600">{item.price.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</td>
                                        <td className="py-4 px-4 text-end font-bold text-gray-800">{(item.quantity * item.price).toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-1/2 rounded-2xl bg-gray-50 p-6 border border-gray-100">
                            <div className="flex justify-between mb-4 text-gray-600">
                                <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                                <span className="font-bold">{(order.totalPrice - order.shippingPrice - order.taxPrice).toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                            </div>
                            <div className="flex justify-between mb-4 text-gray-600">
                                <span>{isAr ? 'مصاريف الشحن' : 'Shipping'}</span>
                                <span className="font-bold">{order.shippingPrice?.toFixed(2) || '0.00'} {isAr ? 'ج.م' : 'EGP'}</span>
                            </div>
                            {order.taxPrice > 0 && (
                                <div className="flex justify-between mb-4 text-gray-600">
                                    <span>{isAr ? 'الضرائب' : 'Tax'}</span>
                                    <span className="font-bold">{order.taxPrice?.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-4 border-t-2 border-gray-200 mt-2">
                                <span className="font-black text-xl text-primary">{isAr ? 'الإجمالي' : 'Total'}</span>
                                <span className="font-black text-xl text-primary">{order.totalPrice?.toFixed(2)} {isAr ? 'ج.م' : 'EGP'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm font-medium">
                        <p>{isAr ? 'شكراً لتسوقكم من رامي المغربي للبصريات' : 'Thank you for shopping at Ramy Elmaghraby Optics'}</p>
                        <div className="flex justify-center gap-4 mt-2 font-mono text-xs">
                            <span>TEL: +201011481980</span>
                            <span className="text-gray-300 mx-2">|</span>
                            <span>MAIL: [EMAIL_ADDRESS]</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

export default PrintableInvoice;
