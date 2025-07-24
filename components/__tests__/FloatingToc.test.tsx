import { render, screen, fireEvent } from '@testing-library/react';
import { FloatingToc } from '../FloatingToc';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('FloatingToc', () => {
  const sampleContent = `
# 标题1
## 标题2
### 标题3
#### 标题4
  `;

  it('renders floating button', () => {
    render(<FloatingToc content={sampleContent} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', '打开目录');
  });

  it('shows menu icon when closed', () => {
    render(<FloatingToc content={sampleContent} />);
    
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
  });

  it('toggles toc panel when button is clicked', () => {
    render(<FloatingToc content={sampleContent} />);
    
    const button = screen.getByRole('button');
    
    // Initially closed
    expect(screen.queryByText('目录')).not.toBeInTheDocument();
    
    // Click to open
    fireEvent.click(button);
    expect(screen.getByText('目录')).toBeInTheDocument();
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    
    // Click to close
    fireEvent.click(button);
    expect(screen.queryByText('目录')).not.toBeInTheDocument();
  });

  it('parses markdown headings correctly', () => {
    render(<FloatingToc content={sampleContent} />);
    
    // Open the toc
    fireEvent.click(screen.getByRole('button'));
    
    // Check if headings are parsed
    expect(screen.getByText('标题1')).toBeInTheDocument();
    expect(screen.getByText('标题2')).toBeInTheDocument();
    expect(screen.getByText('标题3')).toBeInTheDocument();
    expect(screen.getByText('标题4')).toBeInTheDocument();
  });

  it('does not render when no headings found', () => {
    const contentWithoutHeadings = 'Just some plain text without headings.';
    
    render(<FloatingToc content={contentWithoutHeadings} />);
    
    // Should not render anything
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('handles HTML content with headings', () => {
    const htmlContent = `
      <h1 id="heading-0-title1">Title 1</h1>
      <h2 id="heading-1-title2">Title 2</h2>
    `;
    
    render(<FloatingToc content={htmlContent} />);
    
    // Open the toc
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getByText('Title 1')).toBeInTheDocument();
    expect(screen.getByText('Title 2')).toBeInTheDocument();
  });

  it('closes toc when clicking outside', () => {
    render(
      <div>
        <FloatingToc content={sampleContent} />
        <div data-testid="outside-element">Outside content</div>
      </div>
    );
    
    const button = screen.getByRole('button');
    const outsideElement = screen.getByTestId('outside-element');
    
    // Open toc
    fireEvent.click(button);
    expect(screen.getByText('目录')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(outsideElement);
    expect(screen.queryByText('目录')).not.toBeInTheDocument();
  });
});