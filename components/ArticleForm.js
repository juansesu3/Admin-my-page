import { useRouter } from "next/router";
import Editor from "./Editor";
import { useSession } from "next-auth/react";
import { useState } from "react";
import axios from "axios";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";

const ArticleForm = ({
  _id,
  title: existingTitle,
  summary: existingSumary,
  content: existingContent,
  author: existingAuthor,
  imgAuthor: existingImgAuthor,
  images: existingImages,
}) => {
  const { data: session } = useSession();
  const [title, setTitle] = useState(existingTitle || "");
  const [summary, setSummary] = useState(existingSumary || "");
  const [content, setContent] = useState(existingContent || "");
  const [author, setAuthor] = useState(existingAuthor || session?.user?.name);
  const [imgAuthor, setImgAuthor] = useState(
    existingImgAuthor || session?.user?.image
  );
  const [images, setImages] = useState(existingImages || []);
  const [goToArticles, setGoToArticles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const saveArticle = async (ev) => {
    ev.preventDefault();
    const data = { title, summary, content, author, imgAuthor, images };
    if (_id) {
      //update
      await axios.put("/api/articles", { ...data, _id });
    } else {
      //create
      await axios.post("/api/articles", data);
    }
    setGoToArticles(true);
  };
  if (goToArticles) {
    //use router
    router.push("/articles");
  }

  const uploadImages = async (ev) => {
    const files = ev.target?.files;
    if (files?.length > 0) {
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }

      const res = await axios.post("/api/upload", data);
      setImages((oldImages) => {
        return [...oldImages, ...res.data.links];
      });
    }
  };
  const updateImagesOrder = (images) => {
    setImages(images);
  };

  return (
    <form onSubmit={saveArticle}>
      <label>Article name</label>
      <input
        type="text"
        placeholder="article name"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      />
      <label>Photos</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={images}
          className="flex flex-wrap gap-1"
          setList={updateImagesOrder}
        >
          {!!images?.length &&
            images.map((link) => (
              <div key={link} className=" h-24">
                <img src={link} alt="image-proyect" className="rounded-lg" />
              </div>
            ))}
        </ReactSortable>
        {isUploading && (
          <div className="h-24 flex items-center ">
            <Spinner />
          </div>
        )}
        <label className=" w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-gray-500 rounded-lg bg-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Upload</div>
          <input type="file" onChange={uploadImages} className="hidden" />
        </label>
      </div>
      <label>Article summary</label>
      <textarea
        placeholder="summary"
        value={summary}
        onChange={(ev) => setSummary(ev.target.value)}
      ></textarea>
      <label>Article content</label>
      <Editor value={content} onChange={setContent} />
      <label>Article author</label>
      <div className="flex bg-gray-300 gap-1 text-black rounded-lg overflow-hidden mb-2">
        <img
          src={imgAuthor}
          alt="image-boss"
          className="w-8 h-8 rounded-md mt-1 ml-1.5"
          readOnly
        />
        <input
          className="mt-1.5 mr-1"
          type="text"
          placeholder="author"
          value={author}
          readOnly
        />
      </div>
      <button type="submit" className="btn-primary">
        Save
      </button>
    </form>
  );
};

export default ArticleForm;
