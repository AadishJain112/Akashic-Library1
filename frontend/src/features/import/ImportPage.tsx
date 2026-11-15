import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { booksApi, BookDetail } from '../../api/books';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BookCard3D } from '../../components/css3d/BookCard3D';
import { useToast } from '../../components/ui/Toast';
import { PlusCircle, Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export const ImportPage: React.FC = () => {
  const [provider, setProvider] = useState<'google_books' | 'open_library'>('google_books');
  const [externalId, setExternalId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importedBook, setImportedBook] = useState<BookDetail | null>(null);
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalId.trim()) return;

    setIsLoading(true);
    setImportedBook(null);

    try {
      const book = await booksApi.importBook({
        provider,
        external_id: externalId.trim(),
      });
      setImportedBook(book);
      success(`Acquisition catalogued: "${book.title}"`, 'Volume Inscribed');
    } catch (err: any) {
      if (err?.status === 404) {
        toastError('The external archives could not find any volume with that identifier.');
      } else if (err?.status === 502) {
        toastError('The external library provider failed to respond. Please try again later.');
      } else if (err?.status === 503) {
        toastError('The archival catalog is undergoing maintenance.');
      } else {
        toastError(err?.message || 'Failed to import volume into the archives.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
          Archival Intake
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark mt-1 flex items-center justify-center gap-2">
          <span>The Acquisitions Desk</span>
          <PlusCircle className="w-7 h-7 text-wood-dark" />
        </h1>
        <p className="text-sm text-ink-light mt-1 font-serif max-w-md">
          Inscribe a new manuscript into the Akashic universal catalog by querying global bibliographic registries.
        </p>
      </div>

      {/* Acquisitions Intake Desk */}
      <div className="w-full max-w-xl bg-parchment-50 p-8 rounded-3xl border-2 border-brass-antique/50 shadow-parchment-lg parchment-texture">
        <form onSubmit={handleImport} className="space-y-6">
          {/* Provider Selector Tabs */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-light block mb-2">
              External Archival Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider('google_books')}
                className={clsx(
                  'p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all',
                  provider === 'google_books'
                    ? 'bg-wood-dark text-parchment-50 border-wood-deep shadow'
                    : 'bg-parchment-100 text-ink-dark border-wood/30 hover:bg-parchment-200'
                )}
              >
                <Globe className="w-4 h-4 text-brass" />
                <span>Google Books</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider('open_library')}
                className={clsx(
                  'p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all',
                  provider === 'open_library'
                    ? 'bg-wood-dark text-parchment-50 border-wood-deep shadow'
                    : 'bg-parchment-100 text-ink-dark border-wood/30 hover:bg-parchment-200'
                )}
              >
                <Globe className="w-4 h-4 text-jewel-sapphire" />
                <span>Open Library</span>
              </button>
            </div>
          </div>

          {/* External Identifier Field */}
          <Input
            label={provider === 'google_books' ? 'Google Books Volume ID' : 'Open Library Work Key'}
            value={externalId}
            onChange={(e) => setExternalId(e.target.value)}
            placeholder={provider === 'google_books' ? 'e.g. _ojXNuzgHRcC or s1gVAAAAYAAJ' : 'e.g. OL12345W or OL82563W'}
            required
            helperText={
              provider === 'google_books'
                ? 'Found in the Google Books URL after "id="'
                : 'Found in the Open Library URL (starts with OL...W)'
            }
          />

          <Button
            variant="brass"
            type="submit"
            isLoading={isLoading}
            disabled={!externalId.trim()}
            className="w-full py-3 font-bold text-sm shadow"
          >
            <span>Inscribe Into Universal Catalog</span>
          </Button>
        </form>

        {/* SUCCESSFUL INGEST DISPLAY */}
        {importedBook && (
          <div className="mt-8 pt-6 border-t-2 border-brass-antique/40 text-center animate-in fade-in slide-in-from-bottom-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-4">
              <CheckCircle2 className="w-4 h-4 text-jewel-emerald" />
              <span>Volume Inscribed Successfully!</span>
            </div>

            <div className="max-w-xs mx-auto mb-4">
              <BookCard3D
                id={importedBook.id}
                title={importedBook.title}
                authors={importedBook.authors}
                coverUrl={importedBook.covers?.[0]}
                variant="card"
              />
            </div>

            <Button
              variant="primary"
              onClick={() => navigate(`/books/${importedBook.id}`)}
              className="gap-2 shadow"
            >
              <span>Examine Inscribed Reading Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
