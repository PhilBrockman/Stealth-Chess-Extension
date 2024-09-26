import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import type { ComponentPropsWithoutRef } from 'react';
import { useEffect, useState } from 'react';

interface Bookmark {
  id?: string; // Make id optional
  title: string;
  url?: string;
  path: string[];
  isBookmarklet: boolean;
}

const Bookmarklet = ({
  bookmarklet,
  onEdit,
  onDelete,
}: {
  bookmarklet: Bookmark;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (bookmarklet.url) {
      // Execute the bookmarklet code
      const code = bookmarklet.url.replace('javascript:', '');
      // eslint-disable-next-line no-eval
      eval(code);
    }
  };

  return (
    <li className="ml-4 text-blue-500 flex items-center justify-between">
      <button onClick={handleClick} title={bookmarklet.path.join(' > ')} className="hover:underline text-left">
        {bookmarklet.title}
      </button>
      <div>
        <button onClick={onEdit} className="text-yellow-500 mr-2">
          Edit
        </button>
        <button onClick={onDelete} className="text-red-500">
          Delete
        </button>
      </div>
    </li>
  );
};

const BookmarkList = () => {
  const [bookmarklets, setBookmarklets] = useState<Bookmark[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingBookmarklet, setEditingBookmarklet] = useState<Bookmark | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const tree = await chrome.bookmarks.getTree();
      setBookmarklets(processBookmarks(tree));
    };

    fetchBookmarks();

    const handleBookmarkChange = () => {
      fetchBookmarks();
    };

    chrome.bookmarks.onCreated.addListener(handleBookmarkChange);
    chrome.bookmarks.onRemoved.addListener(handleBookmarkChange);
    chrome.bookmarks.onChanged.addListener(handleBookmarkChange);

    return () => {
      chrome.bookmarks.onCreated.removeListener(handleBookmarkChange);
      chrome.bookmarks.onRemoved.removeListener(handleBookmarkChange);
      chrome.bookmarks.onChanged.removeListener(handleBookmarkChange);
    };
  }, [refreshKey]);

  const processBookmarks = (items: chrome.bookmarks.BookmarkTreeNode[], path: string[] = []): Bookmark[] => {
    return items.flatMap(item => {
      const currentPath = [...path, item.title];
      if (item.url?.startsWith('javascript:')) {
        return [
          {
            id: item.id,
            title: item.title,
            url: item.url,
            path: currentPath,
            isBookmarklet: true,
          },
        ];
      }
      if (item.children) {
        return processBookmarks(item.children, currentPath);
      }
      return [];
    });
  };

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleEdit = (bookmarklet: Bookmark) => {
    setEditingBookmarklet(bookmarklet);
  };

  const handleSave = async (updatedBookmarklet: Bookmark) => {
    if (!updatedBookmarklet.id) return;
    await chrome.bookmarks.update(updatedBookmarklet.id, {
      title: updatedBookmarklet.title,
      url: updatedBookmarklet.url,
    });
    setEditingBookmarklet(null);
    handleRefresh();
  };

  const handleDelete = async (id: string) => {
    await chrome.bookmarks.remove(id);
    handleRefresh();
  };

  // const handleCreate = async (newBookmarklet: Omit<Bookmark, 'id'>) => {
  //   await chrome.bookmarks.create({
  //     parentId: '1', // Assuming we're adding to the bookmark bar
  //     title: newBookmarklet.title,
  //     url: newBookmarklet.url,
  //   });
  //   handleRefresh();
  // };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Bookmarklets</h2>
        <button
          onClick={handleRefresh}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm">
          Refresh
        </button>
      </div>
      <ul key={refreshKey}>
        {bookmarklets.map(bookmarklet => (
          <Bookmarklet
            key={bookmarklet.id}
            bookmarklet={bookmarklet}
            onEdit={() => handleEdit(bookmarklet)}
            onDelete={() => bookmarklet.id && handleDelete(bookmarklet.id)}
          />
        ))}
      </ul>
      {editingBookmarklet && (
        <BookmarkletForm
          bookmarklet={editingBookmarklet}
          onSave={handleSave}
          onCancel={() => setEditingBookmarklet(null)}
        />
      )}
      <button
        onClick={() => setEditingBookmarklet({ title: '', url: '', path: [], isBookmarklet: true })}
        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm">
        Add New Bookmarklet
      </button>
    </div>
  );
};

const BookmarkletForm = ({
  bookmarklet,
  onSave,
  onCancel,
}: {
  bookmarklet: Bookmark;
  onSave: (bookmarklet: Bookmark) => void;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState(bookmarklet.title);
  const [url, setUrl] = useState(bookmarklet.url || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...bookmarklet, title, url });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Bookmarklet Title"
        className="w-full p-2 mb-2 border rounded"
      />
      <textarea
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="javascript:..."
        className="w-full p-2 mb-2 border rounded"
      />
      <div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2">
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded">
          Cancel
        </button>
      </div>
    </form>
  );
};

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const logo = isLight ? 'popup/logo_vertical.svg' : 'popup/logo_vertical_dark.svg';

  return (
    <div className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-800'} p-4`}>
      <header className={`App-header ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
        <img src={chrome.runtime.getURL(logo)} className="App-logo w-32 mb-4" alt="logo" />
        <h1 className="text-2xl font-bold mb-4">Bookmark Manager</h1>
        <ToggleButton>Toggle theme</ToggleButton>
      </header>
      <BookmarkList />
    </div>
  );
};

const ToggleButton = (props: ComponentPropsWithoutRef<'button'>) => {
  const theme = useStorage(exampleThemeStorage);
  return (
    <>
      <button
        className={
          props.className +
          ' ' +
          'font-bold mt-4 py-1 px-4 rounded shadow hover:scale-105 ' +
          (theme === 'light' ? 'bg-white text-black shadow-black' : 'bg-black text-white')
        }
        onClick={exampleThemeStorage.toggle}>
        {props.children}
      </button>
    </>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
