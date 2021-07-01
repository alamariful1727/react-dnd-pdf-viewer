import React, { useEffect, useRef, useState } from 'react';
import throttle from 'lodash/throttle';
import { Document, Page } from 'react-pdf';
import pdfImg from './assets/pdf.png';
import crossImg from './assets/cross.png';
// using ES6 modules
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

const App = () => {
	const pdfWrapper = useRef<HTMLDivElement>(null);
	const [initialWidth, setInitialWidth] = useState<number>();
	const [numPages, setNumPages] = useState<number>();
	const [currentPage, setCurrentPage] = useState(1);

	// hover on drop
	const [isFileHoverOnDrop, setFileHoverOnDrop] = useState(false);
	// selected file
	const [selectedFile, setSelectedFile] = useState<File>();
	const [files, setFiles] = useState<File[]>([]);
	// errors
	const [fileError, setFileError] = useState<string>();

	const handleChangeFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setFileError(undefined);

		if (event.target.files) {
			const newFiles = Array.from(event.target.files);

			// ? check errors
			const isError = newFiles.some((v) => {
				const extType = v.name.split('.').pop();

				if (v.type !== 'application/pdf' && extType && extType.toLocaleLowerCase() !== 'pdf') {
					setFileError('Only PDF is allowed.');
					return true;
				} else {
					return false;
				}
			});

			// ? check for uniqueness
			const intersectedFiles = newFiles.filter((a) => files.some((b) => a.name === b.name && a.type === b.type));

			if (intersectedFiles.length > 0) {
				setFileError("Don't select a duplicate file.");
			} else if (!isError) {
				if (files.length > 0) {
					setFiles([...files, ...newFiles]);
				} else {
					setFiles(newFiles);
				}
			}
		}
	};

	const handleRemoveOneFile = (newFile: File) => {
		const _files = [...files];

		// ? check is this the selected file
		if (selectedFile && selectedFile.name === newFile.name && selectedFile.type === newFile.type) {
			setSelectedFile(undefined);
		}
		for (let i = 0; i < _files.length; i++) {
			const _file = _files[i];
			if (_file.name === newFile.name && _file.type === newFile.type) {
				_files.splice(i, 1);
				break;
			}
		}

		setFiles(_files);
	};

	const handleSelectOneFile = (newFile: File) => setSelectedFile(newFile);

	const onDocumentLoadSuccess = ({ numPages }: any) => {
		setNumPages(numPages);
		setPdfSize();
	};

	const changePage = (offset: number) => {
		setCurrentPage((prevPageNumber) => prevPageNumber + offset);
	};

	const previousPage = () => {
		changePage(-1);
	};

	const nextPage = () => {
		changePage(1);
	};

	const setPdfSize = () => {
		if (pdfWrapper && pdfWrapper.current) {
			setInitialWidth(pdfWrapper.current.getBoundingClientRect().width);
		}
	};

	useEffect(() => {
		window.addEventListener('resize', throttle(setPdfSize, 250));
		return () => {
			window.removeEventListener('resize', throttle(setPdfSize, 250));
		};
	}, []);

	// useEffect(() => {
	// 	/*To Prevent right click on screen*/
	// 	document.addEventListener('contextmenu', (event) => {
	// 		event.preventDefault();
	// 	});
	// }, []);

	return (
		<div className='p-6 max-w-lg mx-auto space-y-5'>
			<h1 className='text-2xl text-center font-semibold'>REACT-PDF</h1>
			{selectedFile && (
				<div className='space-y-2'>
					<h2 className='font-semibold'>Selected PDF's preview:</h2>
					<div className='border'>
						<div ref={pdfWrapper}>
							<Document
								file={selectedFile}
								// file='https://typhoon-resource.s3.amazonaws.com/filmmaker_docs/Typhoon-Onboarding-Guide.pdf'
								onLoadSuccess={onDocumentLoadSuccess}
								options={{ workerSrc: 'pdf.worker.js' }}
								noData=''
								loading=''>
								<Page pageNumber={currentPage} loading='' width={initialWidth} />
							</Document>
						</div>
					</div>
					{numPages && (
						<p className='text-center text-gray-500 font-semibold'>
							{currentPage} / {numPages}
						</p>
					)}
					<div className='space-x-5 text-center'>
						<button
							className='bg-gray-800 rounded-lg text-white px-3 py-2'
							type='button'
							disabled={currentPage <= 1}
							onClick={previousPage}>
							Previous
						</button>
						<button
							className='bg-gray-800 rounded-lg text-white px-3 py-2'
							type='button'
							disabled={numPages && currentPage >= numPages ? true : false}
							onClick={nextPage}>
							Next
						</button>
					</div>
				</div>
			)}
			<div className='space-y-2'>
				<div
					className={`border rounded-md ${isFileHoverOnDrop ? 'border-dashed border-gray-800' : ''} ${
						fileError ? 'border-red-500' : 'hover:border-dashed hover:border-gray-800'
					}`}
					onDragEnter={() => {
						setFileHoverOnDrop(true);
					}}
					onDragLeave={() => {
						setFileHoverOnDrop(false);
					}}
					onDragOver={(e) => {
						e.preventDefault();
						setFileHoverOnDrop(true);
					}}
					onDrop={(e) => {
						e.preventDefault();
						setFileHoverOnDrop(false);
						setSelectedFile(undefined);
						// if (e.dataTransfer.files) {
						// 	const files = Array.from(e.dataTransfer.files);
						// 	if (files.length > 1) {
						// 		setFileError('Drop only One file.');
						// 	} else if (files.length === 1 && files[0]) {
						// 		const extType = files[0].name.split('.').pop();
						// 		if (files[0].type !== 'application/pdf' && extType && extType.toLocaleLowerCase() !== 'pdf') {
						// 			setFileError('Only mp4, mov, mt2, mpg, m2t, m2ts, ts and h264 are allowed.');
						// 			return;
						// 		} else {
						// 			setFile(files[0]);
						// 			setFileError(undefined);
						// 			return;
						// 		}
						// 	}
						// }
					}}>
					<input
						accept='application/pdf'
						className='hidden'
						id='browse-file-button'
						type='file'
						onChange={handleChangeFile}
						multiple
					/>
					<label htmlFor='browse-file-button'>
						<div className='flex justify-start space-x-6 items-center p-6 cursor-pointer'>
							<p className='text-gray-800 text-sm'>
								Click here to upload <span className='font-semibold text-base'>FILE</span>
							</p>
						</div>
					</label>
				</div>
				{fileError && <p className='text-red-500 text-xs italic font-medium'>{fileError}</p>}
			</div>

			{files.length > 0 && (
				<div className='border rounded-lg p-2 space-y-3 max-h-80 overflow-auto'>
					{files.map((_file, i) => (
						<div key={i} className='group flex items-center justify-between border hover:bg-gray-100 rounded-lg p-2'>
							<div className='flex-1 flex items-center space-x-5' onClick={() => handleSelectOneFile(_file)}>
								<img src={pdfImg} alt='pdf' />
								<div>
									<h2 className='font-semibold'>{_file.name}</h2>
									<h2>{(_file.size / 1024 / 1024).toFixed(1)} MB</h2>
								</div>
							</div>
							<button
								onClick={() => handleRemoveOneFile(_file)}
								className='hidden group-hover:inline-block bg-gray-200 border border-gray-300 p-2 rounded-full'>
								<img src={crossImg} alt='cross' />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default App;
