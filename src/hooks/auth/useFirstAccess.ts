import { useMutation } from '@tanstack/react-query';
import { activateFirstAccess } from '../../services/authService';

export function useFirstAccess() {
    return useMutation({
        mutationFn: activateFirstAccess,
    });
}
