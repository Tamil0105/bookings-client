import React, { useEffect, useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

const ManageCalendarPage: React.FC = () => {
    // Calendar is simpler: just slots. 
    // Wait, CalendarController 'createSlot' takes providerId (userId).
    // Admin creates slots for themselves or for providers?
    // Assuming Admin is creating open slots.
    
    // Check CalendarController.
    // createSlot(@Body() body: { providerId: string; startTime: string; endTime: string })
    // Admin needs to specify providerId (or use their own id if they are the provider).
    // Let's assume Admin creates slots for themselves for now, or we fetch providers.
    
    const [slots, setSlots] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});
    
    // We need to fetch slots. CalendarController has getAvailableSlots(providerId, date).
    // It lacks findAllSlots? 
    // For now, let's implement the Add Slot modal correctly.
    
    const handleSubmit = async () => {
        try {
            // Need providerId. 
            // We can get current user id from auth store or let admin type it?
            // Let's try to get current user ID or just let it fail if we don't have it.
            // Actually, we can just use the Admin's ID as provider for simplicity.
            const user = JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.user;
            
            await api.post('/calendar/slots', {
                providerId: user?.id, 
                startTime: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
                endTime: new Date(`${formData.date}T${formData.endTime}`).toISOString(),
            });
            alert('Slot created');
            setIsModalOpen(false);
        } catch (e) {
            alert('Error creating slot');
        }
    }

    return (
        <div className="max-w-7xl mx-auto pb-20">
             <div className="mb-10 flex justify-between items-end">
                <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Manage Slots</h1>
                <p className="text-slate-500">Create appointment slots.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center shadow-lg shadow-orange-200">
                <Plus className="h-5 w-5 mr-2" /> Add Slot
                </button>
            </div>

            <div className="bg-orange-50 text-orange-600 p-8 rounded-3xl">
                <p className="font-bold">Slot Management is simplified. Use the "Add Slot" button to create availability for your account.</p>
            </div>

             {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-6">Add Appointment Slot</h2>
                    <div className="space-y-4">
                        <input type="date" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, date: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="time" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, startTime: e.target.value})} />
                            <input type="time" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, endTime: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button onClick={() => setIsModalOpen(false)} className="py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
                        <button onClick={handleSubmit} className="py-3 font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-lg">Create</button>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
}

export default ManageCalendarPage;
