import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  storeApi,
  StoreProduct,
  StoreProductDetail,
  ProductStatus,
  CreateProductPayload,
  UpdateProductPayload,
  UpdateInventoryPayload,
} from '../../api/store';
import { booksApi } from '../../api/books';
import { useBooks } from '../../hooks/useBooks';
import { formatPrice } from '../../api/adapters';
import { useAuth } from '../../app/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { CanvasContainer } from '../../components/three/CanvasContainer';
import { StockroomScene3D } from '../../components/three/StockroomScene3D';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Navigate } from 'react-router-dom';
import {
  Boxes,
  PlusCircle,
  Edit3,
  Layers,
  Search,
  Package,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';

export const StockroomPage: React.FC = () => {
  const { isStoreStaff } = useAuth();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  // If user is neither STORE_MANAGER nor ADMIN, redirect to 403
  if (!isStoreStaff) {
    return <Navigate to="/restricted" replace />;
  }

  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Selected product for inventory or detail edit
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [lookupId, setLookupId] = useState('');

  // Form states for Create Product
  const [newBookSearch, setNewBookSearch] = useState('');
  const [selectedBookRef, setSelectedBookRef] = useState<{ id: string; title: string } | null>(null);
  const [newPrice, setNewPrice] = useState<number>(450);
  const [newEdition, setNewEdition] = useState('First Hardcover Edition');
  const [newCondition, setNewCondition] = useState('Fine / Like New');
  const [newStatus, setNewStatus] = useState<ProductStatus>('IN_STOCK');
  const [newQuantity, setNewQuantity] = useState<number>(10);
  const [newReserved, setNewReserved] = useState<number>(0);

  // Form states for Edit Product Metadata
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editEdition, setEditEdition] = useState('');
  const [editCondition, setEditCondition] = useState('');
  const [editStatus, setEditStatus] = useState<ProductStatus>('IN_STOCK');

  // Form states for Inventory Update
  const [invQty, setInvQty] = useState<number>(0);
  const [invReserved, setInvReserved] = useState<number>(0);

  // Load Products list
  const { data: storeData } = useQuery({
    queryKey: ['stockroom-products', page, pageSize],
    queryFn: () => storeApi.getProducts(page, pageSize),
  });

  const products = storeData?.results || [];
  const bookRefs = products.map((p) => p.book_reference);
  const { data: booksMap = {} } = useBooks(bookRefs);

  // Autocomplete search for book in create modal
  const { data: bookSearchResults } = useQuery({
    queryKey: ['book-search-stockroom', newBookSearch],
    queryFn: () => booksApi.searchBooks({ q: newBookSearch, page_size: 5 }),
    enabled: Boolean(newBookSearch.length >= 2),
  });

  // Selected Product Detail Query (including inventory)
  const { data: activeProductDetail, refetch: refetchActive } = useQuery({
    queryKey: ['product-detail-manage', selectedProductId],
    queryFn: () => (selectedProductId ? storeApi.getProductDetail(selectedProductId) : null),
    enabled: Boolean(selectedProductId),
  });

  // MUTATION: Create Product
  const createMutation = useMutation({
    mutationFn: (payload: CreateProductPayload) => storeApi.createProduct(payload),
    onSuccess: () => {
      success('New volume added to store inventory!', 'Product Created');
      setIsCreateModalOpen(false);
      setSelectedBookRef(null);
      queryClient.invalidateQueries({ queryKey: ['stockroom-products'] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
    },
    onError: (err: any) => {
      toastError(err?.message || 'Could not create store product.');
    },
  });

  // MUTATION: Update Product Metadata
  const updateMetadataMutation = useMutation({
    mutationFn: (payload: UpdateProductPayload) => {
      if (!selectedProductId) throw new Error('No product selected');
      return storeApi.updateProduct(selectedProductId, payload);
    },
    onSuccess: () => {
      success('Product metadata revised.');
      setIsEditModalOpen(false);
      refetchActive();
      queryClient.invalidateQueries({ queryKey: ['stockroom-products'] });
    },
    onError: (err: any) => {
      toastError(err?.message || 'Failed to update product.');
    },
  });

  // MUTATION: Update Inventory
  const updateInventoryMutation = useMutation({
    mutationFn: (payload: UpdateInventoryPayload) => {
      if (!selectedProductId) throw new Error('No product selected');
      return storeApi.updateInventory(selectedProductId, payload);
    },
    onSuccess: () => {
      success('Inventory levels updated. Status auto-recomputed.', 'Inventory Adjusted');
      setIsInventoryModalOpen(false);
      refetchActive();
      queryClient.invalidateQueries({ queryKey: ['stockroom-products'] });
    },
    onError: (err: any) => {
      toastError(err?.message || 'Failed to update inventory. Ensure quantity ≥ reserved.');
    },
  });

  const openEditModal = (p: StoreProductDetail) => {
    setSelectedProductId(p.id);
    setEditPrice(p.price);
    setEditEdition(p.edition);
    setEditCondition(p.condition);
    setEditStatus(p.status);
    setIsEditModalOpen(true);
  };

  const openInventoryModal = (p: StoreProductDetail) => {
    setSelectedProductId(p.id);
    setInvQty(p.inventory?.quantity ?? 0);
    setInvReserved(p.inventory?.reserved_quantity ?? 0);
    setIsInventoryModalOpen(true);
  };

  const handleLookup = () => {
    if (lookupId.trim()) {
      setSelectedProductId(lookupId.trim());
      setLookupId('');
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-2 border-wood/20">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-wood-deep">
            Staff Management
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark mt-1 flex items-center gap-2">
            <span>The Stockroom</span>
            <Boxes className="w-7 h-7 text-wood-dark" />
          </h1>
          <p className="text-xs text-ink-light mt-1 font-serif">
            Curate bookshop inventory, set pricing, adjust reserved allocations, and inspect storage crates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="brass"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Inscribe New Store Product</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: 3D CRATE STACKS & LOOKUP BOX */}
        <div className="lg:col-span-4 bg-parchment-50 p-6 rounded-3xl border-2 border-wood/30 shadow-parchment parchment-texture space-y-6">
          <h3 className="font-serif font-bold text-sm text-ink-dark uppercase tracking-wider text-center">
            Crate Stacks Bay
          </h3>
          <div className="w-full h-56">
            <CanvasContainer camera={{ position: [0, 1.2, 3.5], fov: 40 }}>
              <StockroomScene3D />
            </CanvasContainer>
          </div>

          {/* Open by Product ID Box (Per Section 9.17: discontinued items are excluded from list, reachable via ID) */}
          <div className="p-4 bg-parchment-100 rounded-2xl border border-wood/20 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-light block">
              Open By Product UUID
            </span>
            <p className="text-[10px] text-ink-light font-serif">
              Reach discontinued or archived items directly via their identifier.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="Paste product UUID…"
                className="flex-1 px-3 py-1.5 text-xs bg-parchment-50 border border-wood/30 rounded-lg text-ink font-mono"
              />
              <Button variant="secondary" size="sm" onClick={handleLookup}>
                Load
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT: PRODUCTS TABLE & INVENTORY CONTROLS */}
        <div className="lg:col-span-8 bg-parchment-50 p-6 rounded-3xl border-2 border-wood/30 shadow-parchment parchment-texture space-y-4">
          <h3 className="font-serif font-bold text-lg text-ink-dark">
            Physical Inventory Ledger
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-wood/10 text-ink-light uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3 rounded-l-xl">Volume</th>
                  <th className="p-3">Edition / Condition</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wood/15">
                {products.map((p) => {
                  const book = booksMap[p.book_reference];

                  return (
                    <tr key={p.id} className="hover:bg-wood/5 transition-colors">
                      <td className="p-3">
                        <strong className="font-serif text-ink-dark block text-sm">
                          {book?.title || 'Loading…'}
                        </strong>
                        <span className="text-[10px] text-ink-light font-mono">
                          Ref: {p.book_reference.slice(0, 8)}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-medium text-ink-dark block">{p.edition}</span>
                        <span className="text-ink-light text-[11px]">{p.condition}</span>
                      </td>

                      <td className="p-3 font-serif font-bold text-sm text-ink-dark">
                        {formatPrice(p.price)}
                      </td>

                      <td className="p-3">
                        <Badge variant={p.status === 'IN_STOCK' ? 'emerald' : p.status === 'LOW_STOCK' ? 'amber' : 'neutral'}>
                          {p.status}
                        </Badge>
                      </td>

                      <td className="p-3 text-right space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedProductId(p.id);
                            storeApi.getProductDetail(p.id).then(openInventoryModal);
                          }}
                        >
                          Stock
                        </Button>
                        <Button
                          variant="brass"
                          size="sm"
                          onClick={() => {
                            setSelectedProductId(p.id);
                            storeApi.getProductDetail(p.id).then(openEditModal);
                          }}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE PRODUCT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Inscribe New Store Product"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedBookRef) {
              toastError('Please select a book from the catalogue first.');
              return;
            }
            if (newReserved > newQuantity) {
              toastError('Reserved quantity cannot exceed total quantity.');
              return;
            }
            createMutation.mutate({
              book_reference: selectedBookRef.id,
              price: Number(newPrice),
              edition: newEdition,
              condition: newCondition,
              status: newStatus,
              quantity: Number(newQuantity),
              reserved_quantity: Number(newReserved),
            });
          }}
          className="space-y-4 text-xs"
        >
          {/* Autocomplete book picker */}
          <div>
            <label className="font-semibold uppercase tracking-wider text-ink-light block mb-1">
              Select Book from Catalogue
            </label>
            {selectedBookRef ? (
              <div className="flex items-center justify-between p-2.5 bg-parchment-100 rounded-xl border border-wood/30">
                <span className="font-serif font-bold text-sm text-ink-dark">
                  {selectedBookRef.title}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBookRef(null)}
                  className="text-jewel-ruby font-bold hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={newBookSearch}
                  onChange={(e) => setNewBookSearch(e.target.value)}
                  placeholder="Type book title to search catalogue…"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-parchment-100 border border-wood/30 text-ink focus:outline-none focus:ring-2 focus:ring-brass"
                />
                {bookSearchResults?.results && bookSearchResults.results.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-parchment-50 rounded-xl border border-wood/30 shadow-lg z-20 overflow-hidden divide-y divide-wood/10">
                    {bookSearchResults.results.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBookRef({ id: b.id, title: b.title });
                          setNewBookSearch('');
                        }}
                        className="w-full text-left p-2.5 hover:bg-wood/10 text-xs font-serif font-bold text-ink-dark flex items-center justify-between"
                      >
                        <span className="truncate">{b.title}</span>
                        <span className="text-[10px] text-ink-light shrink-0">
                          {b.authors.slice(0, 1).join('')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (₹)"
              type="number"
              step="0.01"
              min="0"
              value={newPrice}
              onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
              required
            />

            <div>
              <label className="font-semibold uppercase tracking-wider text-ink-light block mb-1">
                Initial Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ProductStatus)}
                className="w-full px-3 py-2 text-sm bg-parchment-100 rounded-xl border border-wood/30 text-ink"
              >
                <option value="IN_STOCK">IN_STOCK</option>
                <option value="LOW_STOCK">LOW_STOCK</option>
                <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                <option value="PREORDER">PREORDER</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Edition"
              value={newEdition}
              onChange={(e) => setNewEdition(e.target.value)}
              placeholder="e.g. First Hardcover Edition"
            />
            <Input
              label="Condition"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              placeholder="e.g. Fine / Like New"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Total Quantity"
              type="number"
              min="0"
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value, 10) || 0)}
            />
            <Input
              label="Reserved Quantity"
              type="number"
              min="0"
              value={newReserved}
              onChange={(e) => setNewReserved(parseInt(e.target.value, 10) || 0)}
              helperText="Must be ≤ Total Quantity"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-wood/20">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="brass"
              type="submit"
              isLoading={createMutation.isPending}
              disabled={!selectedBookRef}
            >
              Add To Stockroom
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT PRODUCT METADATA MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Revise Product Metadata"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMetadataMutation.mutate({
              price: Number(editPrice),
              edition: editEdition,
              condition: editCondition,
              status: editStatus,
            });
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (₹)"
              type="number"
              step="0.01"
              value={editPrice}
              onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
              required
            />
            <div>
              <label className="font-semibold uppercase tracking-wider text-ink-light block mb-1">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as ProductStatus)}
                className="w-full px-3 py-2 text-sm bg-parchment-100 rounded-xl border border-wood/30 text-ink"
              >
                <option value="IN_STOCK">IN_STOCK</option>
                <option value="LOW_STOCK">LOW_STOCK</option>
                <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                <option value="DISCONTINUED">DISCONTINUED</option>
                <option value="PREORDER">PREORDER</option>
              </select>
            </div>
          </div>

          <Input
            label="Edition"
            value={editEdition}
            onChange={(e) => setEditEdition(e.target.value)}
          />
          <Input
            label="Condition"
            value={editCondition}
            onChange={(e) => setEditCondition(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-wood/20">
            <Button variant="ghost" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="brass" type="submit" isLoading={updateMetadataMutation.isPending}>
              Save Revisions
            </Button>
          </div>
        </form>
      </Modal>

      {/* INVENTORY ADJUSTER MODAL */}
      <Modal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        title="Adjust Crate Inventory Levels"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (invReserved > invQty) {
              toastError('Constraint Error: Quantity must be greater than or equal to reserved quantity.');
              return;
            }
            updateInventoryMutation.mutate({
              quantity: invQty,
              reserved_quantity: invReserved,
            });
          }}
          className="space-y-4 text-xs"
        >
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed font-serif">
            Adjusting inventory will automatically update the product status (OUT_OF_STOCK / LOW_STOCK / IN_STOCK) unless discontinued.
          </div>

          {/* Animated Crate Fill Gauge */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-ink-dark">
              <span>Crate Available Quantity:</span>
              <span className="text-jewel-emerald">{Math.max(0, invQty - invReserved)} units</span>
            </div>
            <div className="w-full h-4 bg-wood/15 rounded-full overflow-hidden border border-wood/30">
              <div
                className="h-full bg-jewel-emerald transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(0, ((invQty - invReserved) / Math.max(1, invQty)) * 100))}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Input
              label="Total Quantity"
              type="number"
              min="0"
              value={invQty}
              onChange={(e) => setInvQty(parseInt(e.target.value, 10) || 0)}
              required
            />
            <Input
              label="Reserved Quantity"
              type="number"
              min="0"
              value={invReserved}
              onChange={(e) => setInvReserved(parseInt(e.target.value, 10) || 0)}
              required
              helperText="Enforced: quantity ≥ reserved"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-wood/20">
            <Button variant="ghost" type="button" onClick={() => setIsInventoryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="brass" type="submit" isLoading={updateInventoryMutation.isPending}>
              Update Inventory
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
