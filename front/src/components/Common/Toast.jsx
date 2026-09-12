import { useToast } from '../../hooks/useToast';
import { ToastContainer, ToastItem } from './styles/Toast.styles';

function Toast() {
  const { toasts } = useToast();

  return (
    <ToastContainer>
      {toasts.map(toast => (
        <ToastItem key={toast.id} type={toast.type}>
          <span>{toast.message}</span>
        </ToastItem>
      ))}
    </ToastContainer>
  );
}

export default Toast;
