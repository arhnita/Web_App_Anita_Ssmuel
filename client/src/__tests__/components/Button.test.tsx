import { render, screen } from '@testing-library/react'
import { Button } from "@/components/ui"

describe('Button Component', () => {
    it('renders button with text', () => {
        render(<Button> Click Me</Button>);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('renders loading state', () => {
        render(<Button isLoading>Submit</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    })
})