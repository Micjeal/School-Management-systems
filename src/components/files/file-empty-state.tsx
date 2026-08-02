interface FileEmptyStateProps {
  category?: string;
}

export function FileEmptyState({ category }: FileEmptyStateProps) {
  const getEmptyMessage = () => {
    switch (category) {
      case "documents":
        return "No personal documents yet";
      case "academic":
        return "No published academic files are available";
      case "financial":
        return "No receipts are available";
      case "attachments":
        return "No recent attachments are available";
      default:
        return "No private files yet";
    }
  };

  const getEmptyDescription = () => {
    switch (category) {
      case "documents":
        return "Your person documents will appear here once they are added to your profile.";
      case "academic":
        return "Published report cards and academic documents will appear here when available.";
      case "financial":
        return "Payment receipts and financial documents will appear here when available.";
      case "attachments":
        return "Recent message attachments will appear here when you receive files in conversations.";
      default:
        return "Your personal documents, published reports and authorized receipts will appear here.";
    }
  };

  return (
    <div className="text-center py-12 border rounded-lg">
      <div className="text-muted-foreground mb-2 text-lg font-medium">
        {getEmptyMessage()}
      </div>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        {getEmptyDescription()}
      </p>
    </div>
  );
}
