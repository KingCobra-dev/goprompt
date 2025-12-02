import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { repos as reposApi } from '../lib/api';
import { useApp } from '../contexts/AppContext';
import * as XLSX from 'xlsx';
import { FileText, Upload, Database, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface RepoRow {
  name: string;
  description: string;
  visibility: 'public' | 'private';
  tags: string;
}

export default function BulkRepoCreator() {
  const { state } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<RepoRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] }>({ success: 0, errors: [] });
  const [allowOverwrites, setAllowOverwrites] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedData([]);
      setErrors([]);
      setResults({ success: 0, errors: [] });
    }
  };

  const parseFile = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row
        const rows = jsonData.slice(1) as any[][];

        const parsed: RepoRow[] = [];
        const parseErrors: string[] = [];

        rows.forEach((row, index) => {
          if (row.length === 0) return; // Skip empty rows

          const [name, description, visibility, tags] = row;

          if (!name || typeof name !== 'string') {
            parseErrors.push(`Row ${index + 2}: Missing or invalid name`);
            return;
          }

          if (visibility && !['public', 'private'].includes(visibility)) {
            parseErrors.push(`Row ${index + 2}: Invalid visibility (must be 'public' or 'private')`);
            return;
          }

          parsed.push({
            name: name.trim(),
            description: (description || '').toString().trim(),
            visibility: (visibility as 'public' | 'private') || 'public',
            tags: (tags || '').toString().trim(),
          });
        });

        setParsedData(parsed);
        setErrors(parseErrors);
      } catch (error) {
        setErrors(['Failed to parse Excel file. Please check the format.']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const submitRepos = async () => {
    if (parsedData.length === 0) return;

    setIsSubmitting(true);
    setResults({ success: 0, errors: [] });
    setProgress(0);
    setCurrentOperation('Checking for duplicates...');

    const submitErrors: string[] = [];
    let successCount = 0;

    // Get existing repos for duplicate check
    const { data: existingRepos } = await reposApi.getAll(state.user?.id);

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      setCurrentOperation(`Processing "${row.name}" (${i + 1}/${parsedData.length})`);
      setProgress(((i + 1) / parsedData.length) * 100);

      try {
        // Check for duplicates
        const isDuplicate = existingRepos?.some(r => r.name === row.name && r.userId === state.user?.id);
        if (isDuplicate && !allowOverwrites) {
          submitErrors.push(`Skipped "${row.name}": Repository already exists`);
          continue;
        }

        const repoData = {
          name: row.name,
          description: row.description,
          visibility: row.visibility,
          tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
          userId: state.user?.id,
        };

        const { error } = await reposApi.create(repoData);
        if (error) {
          submitErrors.push(`Failed to create "${row.name}": ${typeof error === 'string' ? error : 'Unknown error'}`);
        } else {
          successCount++;
        }
      } catch (err: any) {
        submitErrors.push(`Failed to create "${row.name}": ${err.message}`);
      }
    }

    setResults({ success: successCount, errors: submitErrors });
    setCurrentOperation('');
    setProgress(100);
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Create Repositories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">How to use:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Upload an Excel file with repository data</li>
            <li>Click "Parse Excel File" to validate and preview the data</li>
            <li>Review the parsed data in the table below</li>
            <li>Click "Create Repositories" to bulk create them</li>
          </ol>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Excel File (.xlsx)
          </label>
          <Input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            Columns: name, description, visibility, tags
          </p>
        </div>

        {!file ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Select an Excel file above to get started</p>
          </div>
        ) : (
          <Button 
            onClick={parseFile} 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-black"
          >
            <FileText className="w-4 h-4 mr-2" />
            Parse Excel File
          </Button>
        )}

        {errors.length > 0 && (
          <Alert>
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {parsedData.length > 0 && (
          <>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow-overwrites"
                checked={allowOverwrites}
                onCheckedChange={(checked) => setAllowOverwrites(checked === true)}
              />
              <label htmlFor="allow-overwrites" className="text-sm">
                Allow overwrites (update existing repos)
              </label>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.visibility}</TableCell>
                      <TableCell>{row.tags}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button 
              onClick={submitRepos} 
              disabled={isSubmitting}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-black font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Repositories...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Create {parsedData.length} Repositories
                </>
              )}
            </Button>

            {isSubmitting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{currentOperation}</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </>
        )}

        {results.success > 0 || results.errors.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Badge variant={results.errors.length === 0 ? "default" : "secondary"} className="flex items-center gap-1 text-black">
                <CheckCircle className="w-3 h-3" />
                {results.success} Created
              </Badge>
              {results.errors.length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1 text-black">
                <XCircle className="w-3 h-3" />
                {results.errors.length} Failed
              </Badge>
              )}
            </div>
            
            {results.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Errors encountered:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {results.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}