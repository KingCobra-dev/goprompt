
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Users } from 'lucide-react'

interface PromptSuccessPanelProps {
  averageRating: number
  totalVotes: number
  successRate: number
  commonUseCases: string[]
  improvementSuggestions: string[]
  promptId: string
}

export function PromptSuccessPanel({
  averageRating,
  totalVotes,
  successRate,
  commonUseCases: _commonUseCases,
  improvementSuggestions: _improvementSuggestions,
  promptId: _promptId,
}: PromptSuccessPanelProps) {
 

  return (
    
     <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Community Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Success Rate</h3>
            <p className="text-2xl font-bold">{Math.round(successRate)}%</p>
            <p className="text-sm text-muted-foreground">Based on {totalVotes} ratings</p>
         
          </div>

          <div>
            <h3 className="font-medium mb-2">Average Rating</h3>
            <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Out of 5 stars</p>
     
          </div>
            </div>
      </CardContent>
    </Card>
  )
}
