'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  categorySchema,
  itemSchema,
  optionSchema,
  type CategoryFormValues,
  type ItemFormValues,
  type OptionFormValues,
} from './schemas';
import { useBranchMenu } from './hooks';

interface BranchMenuPageProps {
  params: {
    branchId: string;
  };
}

export default function BranchMenuPage({ params }: BranchMenuPageProps) {
  const router = useRouter();
  const { branchId } = params;

  const {
    loading,
    categories,
    createCategory,
    createItem,
    createOption,
    deleteCategory,
    deleteItem,
    toggleItemAvailability,
    deleteOption,
  } = useBranchMenu(branchId);

  const {
    register: registerCategory,
    handleSubmit: handleSubmitCategory,
    reset: resetCategory,
    formState: { errors: categoryErrors, isSubmitting: isSubmittingCategory },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      sortOrder: '',
    },
  });

  const {
    register: registerItem,
    handleSubmit: handleSubmitItem,
    reset: resetItem,
    formState: { errors: itemErrors, isSubmitting: isSubmittingItem },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      categoryId: '',
      name: '',
      description: '',
      imageUrl: '',
      basePrice: '',
      taxCategory: '',
      isAvailable: true,
    },
  });

  const {
    register: registerOption,
    handleSubmit: handleSubmitOption,
    reset: resetOption,
    formState: { errors: optionErrors, isSubmitting: isSubmittingOption },
  } = useForm<OptionFormValues>({
    resolver: zodResolver(optionSchema),
    defaultValues: {
      itemId: '',
      type: '',
      name: '',
      priceDelta: '',
      isRequired: false,
      maxSelection: '',
    },
  });
  const onCreateCategory = async (values: CategoryFormValues) => {
    const ok = await createCategory(values);
    if (ok) {
      resetCategory({ name: '', sortOrder: '' });
    }
  };

  const onCreateItem = async (values: ItemFormValues) => {
    const ok = await createItem(values);
    if (ok) {
      resetItem({
        categoryId: values.categoryId,
        name: '',
        description: '',
        imageUrl: '',
        basePrice: '',
        taxCategory: '',
        isAvailable: true,
      });
    }
  };

  const onCreateOption = async (values: OptionFormValues) => {
    const ok = await createOption(values);
    if (ok) {
      resetOption({
        itemId: values.itemId,
        type: '',
        name: '',
        priceDelta: '',
        isRequired: false,
        maxSelection: '',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Delete this category and all its items?')) {
      return;
    }

    await deleteCategory(categoryId);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Delete this menu item?')) {
      return;
    }

    await deleteItem(itemId);
  };

  const handleToggleItemAvailability = async (
    itemId: string,
    current: boolean,
  ) => {
    await toggleItemAvailability(itemId, current);
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!window.confirm('Delete this menu option?')) {
      return;
    }

    await deleteOption(optionId);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Loading branch menu...
        </p>
      </div>
    );
  }

  const allItems = categories.flatMap((category) => category.items);

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="flex w-full max-w-5xl flex-col gap-6 rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Branch Menu
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Manage categories, items, and options for this branch.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/vendor')}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Back to vendor portal
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <form
            className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
            onSubmit={handleSubmitCategory(onCreateCategory)}
            noValidate
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Add category
            </h2>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Name</span>
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerCategory('name')}
              />
              {categoryErrors.name && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {categoryErrors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Sort order</span>
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerCategory('sortOrder')}
              />
              {categoryErrors.sortOrder && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {categoryErrors.sortOrder.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmittingCategory}
              className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSubmittingCategory ? 'Adding...' : 'Add category'}
            </button>
          </form>

          <form
            className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
            onSubmit={handleSubmitItem(onCreateItem)}
            noValidate
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Add item
            </h2>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Category</span>
                <span className="text-red-600">*</span>
              </label>
              <select
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerItem('categoryId')}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {itemErrors.categoryId && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {itemErrors.categoryId.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Name</span>
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerItem('name')}
              />
              {itemErrors.name && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {itemErrors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Base price</span>
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerItem('basePrice')}
              />
              {itemErrors.basePrice && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {itemErrors.basePrice.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Description
              </label>
              <textarea
                rows={2}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerItem('description')}
              />
              {itemErrors.description && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {itemErrors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Image URL
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerItem('imageUrl')}
              />
              {itemErrors.imageUrl && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {itemErrors.imageUrl.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Tax category
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerItem('taxCategory')}
              />
              {itemErrors.taxCategory && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {itemErrors.taxCategory.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isAvailable"
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
                {...registerItem('isAvailable')}
              />
              <label
                htmlFor="isAvailable"
                className="text-xs text-zinc-700 dark:text-zinc-300"
              >
                Item is available
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmittingItem}
              className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSubmittingItem ? 'Adding...' : 'Add item'}
            </button>
          </form>

          <form
            className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
            onSubmit={handleSubmitOption(onCreateOption)}
            noValidate
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Add option
            </h2>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Item</span>
                <span className="text-red-600">*</span>
              </label>
              <select
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerOption('itemId')}
              >
                <option value="">Select an item</option>
                {categories.map((category) => (
                  <optgroup key={category.id} label={category.name}>
                    {category.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {optionErrors.itemId && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {optionErrors.itemId.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Type</span>
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerOption('type')}
              />
              {optionErrors.type && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {optionErrors.type.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Name</span>
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerOption('name')}
              />
              {optionErrors.name && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {optionErrors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Price difference
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerOption('priceDelta')}
              />
              {optionErrors.priceDelta && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {optionErrors.priceDelta.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Max selection
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                {...registerOption('maxSelection')}
              />
              {optionErrors.maxSelection && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  {optionErrors.maxSelection.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isRequired"
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
                {...registerOption('isRequired')}
              />
              <label
                htmlFor="isRequired"
                className="text-xs text-zinc-700 dark:text-zinc-300"
              >
                Option is required
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmittingOption}
              className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isSubmittingOption ? 'Adding...' : 'Add option'}
            </button>
          </form>
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Current menu
          </h2>

          {categories.length === 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No categories or items have been created yet.
            </p>
          )}

          {categories.map((category) => (
            <div
              key={category.id}
              className="space-y-3 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {category.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Sort order: {category.sortOrder}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                >
                  Delete category
                </button>
              </div>

              {category.items.length === 0 && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  No items in this category yet.
                </p>
              )}

              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="space-y-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          {item.name}
                        </p>
                        {!item.isAvailable && (
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
                            Unavailable
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">
                        {`Price: ${Number(item.basePrice).toFixed(2)}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleItemAvailability(item.id, item.isAvailable)
                        }
                        className="rounded-md border border-zinc-300 px-2 py-1 text-[11px] font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
                      >
                        {item.isAvailable ? 'Mark unavailable' : 'Mark available'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="rounded-md border border-red-300 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                      >
                        Delete item
                      </button>
                    </div>
                  </div>

                  {item.options.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {item.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between rounded border border-dashed border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
                        >
                          <div>
                            <p className="font-medium text-zinc-800 dark:text-zinc-100">
                              {option.name}
                            </p>
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                              {option.type}
                              {option.priceDelta
                                ? ` • +${Number(option.priceDelta).toFixed(2)}`
                                : ''}
                              {option.isRequired ? ' • Required' : ''}
                              {option.maxSelection
                                ? ` • Max ${option.maxSelection}`
                                : ''}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteOption(option.id)}
                            className="rounded-md border border-red-300 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
