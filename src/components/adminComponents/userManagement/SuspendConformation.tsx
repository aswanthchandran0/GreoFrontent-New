import Modal from 'react-modal'
import { suspendUserApi,unSuspendUserApi } from '../../../services/admin/adminApi';
import React from 'react';
import {toast} from 'react-hot-toast'

interface SuspendModalProps {
    isOpen: boolean;
    onClose: () => void;
    id: string;
    username: string;
    is_suspended: boolean;
    onSuspend: (id: string) => void;
    onUnSuspend: (id: string) => void;
  }
  
const SuspendConformationModal:React.FC<SuspendModalProps>=({ isOpen, onClose, id, username,is_suspended,onSuspend,onUnSuspend })=>{
  const handleSuspend = async () => {
    try {

      if(!is_suspended){
        const response =    await suspendUserApi(id);

        if(response.status === 200){
          onSuspend(id);
          toast.success(`${username} suspended`);
         
          
          onClose();
        
        }else{
          toast.error('failed to suspend User')
          onClose()
        }
         
      }else{
        const response = await unSuspendUserApi(id);

        if(response.status === 200){
          onUnSuspend(id);
          toast.success(` ${username} unsuspended`);
          onClose();
        }else{
          toast.error('failed to unsuspend User')
      }
    }
    } catch (error) {
      toast.error('Failed to suspend user');
      console.error('Failed to suspend user:', error);
      onClose()
    }
  };
      
    return(
        <>
          <Modal 
       
       isOpen={isOpen}
       onRequestClose={onClose}
       className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
       overlayClassName="fixed inset-0  bg-opacity-50"
       >
        <div className="fixed inset-0 flex items-center justify-center ">
          <div className="flex flex-col items-center justify-center w-full h-full max-w-lg p-4 rounded bg-background-light max-h-72">
            <div className="p-2">
         <span className="text-xl font-bold text-primary font-lato">{is_suspended ? 'Unsuspend User' : 'Suspend User'}</span>
            </div>
          
         <div className="flex flex-col items-center justify-center">
            <span className="font-bold text-primary font-lato"> Are you Sure you want to {is_suspended ? 'unsuspend' : 'suspend'} </span>
            <span className="font-bold text-primary font-lato">{username}?</span>
          </div>

          <div className="p-2 space-x-2">
          <button onClick={onClose} className="p-2 rounded bg-primary hover:bg-accent text-background">cancel</button>
          <button onClick={handleSuspend} className={`${is_suspended ? 'bg-green-500' :'bg-red-500'}  p-2 hover:bg-red-600  rounded text-background`}>{is_suspended ? 'Unsuspend' : 'Suspend'}</button>

          </div>
          </div>
        </div>
        </Modal>
        </>
    )
}


export default SuspendConformationModal