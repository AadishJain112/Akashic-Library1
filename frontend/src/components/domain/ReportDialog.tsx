import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { communityApi } from '../../api/community';
import { useToast } from '../ui/Toast';
import { Flag, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'DISCUSSION' | 'REPLY';
  targetId: string;
}

const PRESET_REASONS = ['Spam', 'Harassment', 'Spoilers', 'Off-topic', 'Copyright Infringement', 'Other'];

export const ReportDialog: React.FC<ReportDialogProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
}) => {
  const [reason, setReason] = useState('Spam');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: toastError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await communityApi.createReport({
        target_type: targetType,
        target_id: targetId,
        reason: reason.slice(0, 100),
        details: details ? details.slice(0, 1000) : undefined,
      });
      success('The Wardens have received your report and will inspect this entry.', 'Report Filed');
      onClose();
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('already') || err?.status === 400) {
        toastError("You've already reported this item; the Wardens are reviewing it.", 'Notice');
      } else {
        toastError(err?.message || 'Failed to submit report. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notify the Wardens">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Wardens uphold decorum and harmony in the Reading Circle. Reports are handled with discretion.
          </span>
        </div>

        {/* Reason preset chips */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-light block mb-2">
            Reason for Report
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                  reason === r
                    ? 'bg-jewel-ruby text-white border-jewel-ruby shadow-sm'
                    : 'bg-parchment-100 text-ink-dark border-wood/30 hover:bg-parchment-200'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Additional details */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-ink-light block mb-1">
            Details (optional, max 1000 characters)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value.slice(0, 1000))}
            rows={3}
            placeholder="Provide context for the moderator..."
            className="w-full p-3 rounded-xl text-sm bg-parchment-50 border border-wood/30 focus:outline-none focus:ring-2 focus:ring-brass-dark text-ink shadow-inner placeholder:text-ink-light/50"
          />
          <div className="text-right text-[10px] text-ink-light mt-1">
            {details.length}/1000
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-wood/20">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" type="submit" isLoading={isSubmitting} className="gap-2">
            <Flag className="w-4 h-4" />
            <span>Submit to Night Watch</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
