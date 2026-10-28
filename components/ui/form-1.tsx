import React, { useState } from "react";

export default function Example() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/90 text-slate-100 p-8 rounded-3xl border border-slate-700/60 shadow-2xl backdrop-blur-xl">
      <form onSubmit={handleSubmit} className="flex flex-col items-center text-sm">
        <p className="text-xs bg-indigo-500/20 text-indigo-400 font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          Contact Us
        </p>
        <h1 className="text-3xl font-bold py-2 text-center text-white">Let’s Get In Touch.</h1>
        <p className="text-xs text-slate-400 pb-6 text-center">
          새로운 프로젝트나 협업 문의를 남겨주시면 빠르게 검토 후 연락드리겠습니다.
        </p>

        {submitted ? (
          <div className="w-full py-8 text-center bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold">
              ✓
            </div>
            <h4 className="text-lg font-semibold text-white mb-1">문의가 접수되었습니다.</h4>
            <p className="text-xs text-slate-400">담당자가 확인 후 입력해주신 연락처로 신속히 답변드리겠습니다.</p>
          </div>
        ) : (
          <div className="w-full space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-slate-300 mb-1.5">
                성명
              </label>
              <div className="flex items-center h-11 pl-3.5 border border-slate-700 rounded-full bg-slate-800/60 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-slate-400 shrink-0">
                  <path
                    d="M18.311 16.406a9.64 9.64 0 0 0-4.748-4.158 5.938 5.938 0 1 0-7.125 0 9.64 9.64 0 0 0-4.749 4.158.937.937 0 1 0 1.623.938c1.416-2.447 3.916-3.906 6.688-3.906 2.773 0 5.273 1.46 6.689 3.906a.938.938 0 0 0 1.622-.938M5.938 7.5a4.063 4.063 0 1 1 8.125 0 4.063 4.063 0 0 1-8.125 0"
                    fill="currentColor"
                  />
                </svg>
                <input
                  id="name"
                  type="text"
                  className="h-full px-3 w-full outline-none bg-transparent text-sm text-white placeholder:text-slate-500"
                  placeholder="성함을 입력해주세요"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email-address" className="block text-xs font-medium text-slate-300 mb-1.5">
                이메일
              </label>
              <div className="flex items-center h-11 pl-3.5 border border-slate-700 rounded-full bg-slate-800/60 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-slate-400 shrink-0">
                  <path
                    d="M17.5 3.438h-15a.937.937 0 0 0-.937.937V15a1.563 1.563 0 0 0 1.562 1.563h13.75A1.563 1.563 0 0 0 18.438 15V4.375a.94.94 0 0 0-.938-.937m-2.41 1.874L10 9.979 4.91 5.313zM3.438 14.688v-8.18l5.928 5.434a.937.937 0 0 0 1.268 0l5.929-5.435v8.182z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  id="email-address"
                  type="email"
                  className="h-full px-3 w-full outline-none bg-transparent text-sm text-white placeholder:text-slate-500"
                  placeholder="이메일 주소를 입력해주세요"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-medium text-slate-300 mb-1.5">
                전화번호
              </label>
              <div className="flex items-center h-11 pl-3.5 border border-slate-700 rounded-full bg-slate-800/60 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-slate-400 shrink-0">
                  <path
                    d="M3.625 2.5h2.5a1.25 1.25 0 0 1 1.218.966l.75 3.125a1.25 1.25 0 0 1-.356 1.184L6.094 9.422a10.04 10.04 0 0 0 4.484 4.484l1.647-1.643a1.25 1.25 0 0 1 1.184-.356l3.125.75a1.25 1.25 0 0 1 .966 1.218v2.5a1.25 1.25 0 0 1-1.25 1.25C8.01 17.625 2.375 11.99 2.375 3.75A1.25 1.25 0 0 1 3.625 2.5z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  id="phone"
                  type="tel"
                  className="h-full px-3 w-full outline-none bg-transparent text-sm text-white placeholder:text-slate-500"
                  placeholder="전화번호를 입력해주세요"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-medium text-slate-300 mb-1.5">
                문의 내용
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-white placeholder:text-slate-500"
                placeholder="문의하실 내용을 자유롭게 작성해주세요"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 w-full rounded-full transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <span>문의하기</span>
              <svg width="18" height="18" viewBox="0 0 21 20" fill="none">
                <path
                  d="m18.038 10.663-5.625 5.625a.94.94 0 0 1-1.328-1.328l4.024-4.023H3.625a.938.938 0 0 1 0-1.875h11.484l-4.022-4.025a.94.94 0 0 1 1.328-1.328l5.625 5.625a.935.935 0 0 1-.002 1.33"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
