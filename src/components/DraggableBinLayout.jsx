import { useState } from 'react';

const DraggableBinLayout = ({ bins, output, onContentMove }) => {
  const [draggedContent, setDraggedContent] = useState(null);

  const parseOutput = (output) => {
    if (!output) return [];
    return output.split('\n').map(line => {
      const [binId, content] = line.split(': ');
      const contentItems = content ? content.split(', ') : ['-'];
      return {
        id: binId.replace('Bin ', ''),
        contents: contentItems
      };
    });
  };

  const handleDragStart = (e, binId, content, contentIndex) => {
    setDraggedContent({ binId, content, contentIndex });
    e.target.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedContent(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '';
  };

  const handleDrop = (e, targetBinId) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '';
    
    if (!draggedContent || draggedContent.binId === targetBinId) return;

    // Here, we handle the actual move: add the dragged content to the target bin
    onContentMove(draggedContent.binId, targetBinId, draggedContent.content);

    setDraggedContent(null);
  };

  const renderDraggableContent = (content, index, binId) => {
    if (content === '-') return <span className="text-gray-400">-</span>;
    
    return (
      <span
        draggable
        onDragStart={(e) => handleDragStart(e, binId, content, index)}
        onDragEnd={handleDragEnd}
        className="cursor-move hover:bg-blue-50 px-1 rounded"
      >
        {content}
      </span>
    );
  };

  const parsedOutput = parseOutput(output);

  return (
    <div className="font-mono text-sm">
      <div>
        {parsedOutput.map(({ id, contents }) => (
          <div
            key={id}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, id)}
            className="p-2 hover:bg-gray-50 rounded transition-colors"
          >
            <span className="font-semibold">Bin {id}: </span>
            {contents.map((content, index) => (
              <span key={`${id}-${index}`}>
                {index > 0 && <span className="text-gray-400">, </span>}
                {renderDraggableContent(content, index, id)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraggableBinLayout;
