import React, { useEffect, useRef, useState } from 'react';
import throttle from 'lodash/throttle';
import { Document, Page } from 'react-pdf';
// using ES6 modules
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

const App = () => {
	const pdfWrapper = useRef<HTMLDivElement>(null);
	const [initialWidth, setInitialWidth] = useState<number>();
	const [numPages, setNumPages] = useState<number>();
	const [currentPage, setCurrentPage] = useState(1);

	const onDocumentLoadSuccess = ({ numPages }: any) => {
		setNumPages(numPages);
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
		setPdfSize();
		return () => {
			window.removeEventListener('resize', throttle(setPdfSize, 250));
		};
	}, []);

	useEffect(() => {
		/*To Prevent right click on screen*/
		document.addEventListener('contextmenu', (event) => {
			event.preventDefault();
		});
	}, []);

	return (
		<div className='p-6 space-y-5'>
			<h1 className='text-2xl text-center font-semibold'>REACT-PDF</h1>
			<div className='max-w-xl mx-auto border'>
				<div ref={pdfWrapper}>
					<Document
						// file='cv.pdf'
						file='https://typhoon-resource.s3.amazonaws.com/filmmaker_docs/Typhoon-Onboarding-Guide.pdf'
						onLoadSuccess={onDocumentLoadSuccess}
						options={{ workerSrc: 'pdf.worker.js' }}
						noData=''
						loading=''>
						<Page pageNumber={currentPage} loading='' width={initialWidth} />
					</Document>
				</div>
			</div>
			<div className='space-y-2'>
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
		</div>
	);
};

export default App;
