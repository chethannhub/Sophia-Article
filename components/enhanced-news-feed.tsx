'use client'
import './markdown.css';
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Newspaper, MessageSquare, ShoppingCart, Search, Trash2, Headphones, MessageCircle, X, Menu, PlayCircle, PauseCircle , MinusCircle} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Download } from 'lucide-react';

import ChatDialog from "./ChatDialog"
import { ar } from 'date-fns/locale';

// Add this interface near the top of your file

const url = " http://127.0.0.1:5000";

interface Article {
  publishedAt: string | number | Date;
  author: string;
  urls: string | number;
  id: number;
  title: string;
  brief: string;
  image: string;
  content: string;
  label: string;
  isSaved?: boolean;
}

// Simulated API call for fetching news
const fetchNews = async (
  page: number,
  searchTerm: string,
  category: string
): Promise<Article[]> => {
  try {
    const response = await fetch(`${url}/get_daily_news`, {
            method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query_news: 'ml',
        query_edge: 'aiml',
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
  

    if (!data.Articles) {
      throw new Error('Articles not found in response');
    }
    // ai ml ar vr block chain
    const allNews = data.Articles.map((item: Article) => ({
      id: item.id,
      title: item.title,
      brief: item.brief,
      image: item.image || "https://www.sandipuniversity.edu.in/computer-science/images/header/BTech-CSE-with-specialisation-Artificial-Intelligence-and-Machine-Learning.jpg",
      content: (item.content || 'Lorem ipsum dolor sit amet...').slice(0, 600)+'.....',
      urls: item.urls,
      author:item.author,
      label: item.label,
    }));

    return allNews.filter(
      (article :Article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (category === 'All' || article.label === category)
    ).slice((page - 1) * 10, page * 10);
  } catch (error) {
    console.error('Fetch News Error:', error);
    return [];
  }
};




export function EnhancedNewsFeedComponent() {
  const [newsArticles, setNewsArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [cart, setCart] = useState<Article[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("All")
  const [isLoading, setIsLoading] = useState(false)
  const [summaries, setSummaries] = useState<{
      aggregate: string | null | undefined; [key: number]: string 
  }>({ aggregate: null })
// To track which summary is active

  const [audioMessages, setAudioMessages] = useState<{ [key: string]: string }>({})
  const [chatMessages, setChatMessages] = useState<{ [key: string]: { role: string; content: string }[] }>({})
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [currentChatArticle, setCurrentChatArticle] = useState<Article | null>(null)
  const [chatInput, setChatInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [chatId, setChatId] = useState(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  useEffect(() => {
    loadNews()
  }, [page, searchTerm, category])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages])

  const loadNews = async () => {
    setIsLoading(true)
    const articles = await fetchNews(page, searchTerm, category)
    setNewsArticles(articles)
    setIsLoading(false)
  }

  const openModal = (article:Article) => {
    setSelectedArticle(article)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const addToCart = (article :Article) => {
    article.isSaved = true;
    if (!cart.some(item => item.id === article.id)) {
      setCart([...cart, article])
    }
  }

  // const clearSummary = (articleId) => {
  //   setSummaries(prevSummaries => ({
  //     ...prevSummaries,
  //     [articleId]: null // Clear the specific summary
  //   }));
  //   setActiveSummaryId(null); // Reset active summary
  // };
  const removeFromCart = (article:Article) => {
    article.isSaved = false;
    setCart(cart.filter(item => item.id !== article.id))
  }

  const clearCart = () => {
    for (const article of cart) {
      article.isSaved = false;
    }
    setCart([])
    setSummaries({ aggregate: null })
    setAudioMessages({})
    setChatMessages({})
  }
  const handleSummarize = async (articleIds: number[]) => {
    console.log('Summarizing articles:', articleIds);
    setSummaries({ ...summaries, aggregate: "Summarizing..." });

    try {
      const response = await fetch(`${url}/summarize?urls=${articleIds.join(',')}`);
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API response data:", data);

      if (!data.summary) {
        throw new Error("Invalid response format from API");
      }

      // Update the summaries state with the summary
      setSummaries(prevSummaries => ({
        ...prevSummaries,
        aggregate: data.summary
      }));
    } catch (error) {
      console.error("Error summarizing articles:", error);
      setSummaries(prevSummaries => ({
        ...prevSummaries,
        aggregate: `Error occurred while summarizing articles: ${(error as Error).message}`
      }));
    }
  }
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1); // Reset page number to 1
  };
  const handleConvertToAudio = async (articleIds: number[]) => {
    setAudioMessages({ aggregate: "Converting to audio..." });
    setIsLoading(true);
  
    try {
      // Send request to Flask backend with article IDs
      const response = await fetch(`${url}/get_audio`, {
        method: 'POST', // Use POST if your backend expects it, otherwise keep it GET
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: articleIds }) // Send the article IDs in the body
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      // Get the audio file URL directly from the response
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob); // Create a blob URL for the audio file
  
      // Only set the audio message for the last article
      const lastArticleId = articleIds[articleIds.length - 1];
      setAudioMessages(prevMessages => ({
        ...prevMessages,
        [lastArticleId]: audioUrl // Store the blob URL
      }));
  
    } catch (error) {
      console.error("Error converting to audio:", error);
      setAudioMessages({ aggregate: "Error occurred while converting to audio." });
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleAudioPlayback = (articleId: string) => {
    setPlayingAudio(prev => (prev === articleId ? null : articleId));
  };
  
  const downloadAudio = (articleId: string) => {
    const audioMessage = audioMessages[articleId];
    if (audioMessage) {
      const link = document.createElement('a');
      link.href = audioMessage; // Use the blob URL stored in audioMessage
      link.download = `article_${articleId}_audio.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error(`No audio message found for article ID: ${articleId}`);
    }
  };
  const openChatModal = async (articleIds: number[]) => { // Assuming articleId is of type number
    // Optional: You can choose to set the current chat article to the first one or handle it differently
    if (articleIds.length > 0) {
      const article = newsArticles.find(article => article.id === articleIds[0]);
      if (article) {
        setCurrentChatArticle(article);
      }
    }
    
    setIsChatModalOpen(true);
    console.log("i am executed");
  
    try {
      // Make a request for the first article or handle it differently if needed
      const response = await fetch(`${url}/chat?urls=${articleIds.join(",")}`); // Join IDs into a comma-separated string
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setChatId(data.chat_id);
      console.log(data.chat_id);
    } catch (error) {
      console.error("Error initializing chat:", error);
    }
  };
  
  const handleChatSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault()
    console.log(chatId , "text" , e);
    const updatedMessages = [
      ...(currentChatArticle ? chatMessages[currentChatArticle.id] || [] : []),
      { role: 'user', content: chatInput }
    ]
    if (currentChatArticle) {
    setChatMessages({
      ...chatMessages,
      [currentChatArticle.id]: updatedMessages
    })
  }
    setChatInput("")
    try {
      const response = await fetch(`${url}/continue_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: chatInput
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const aiResponse = data.response;

      setChatMessages({
        ...chatMessages,
        [currentChatArticle?.id ?? '']: [
          ...updatedMessages,
          { role: 'ai', content: aiResponse }
        ]
      })
      // const CodeBlock = ({ node, inline, ...props }) => {
      //   return inline ? (
      //     <code className="bg-gray-200 rounded px-1" {...props} />
      //   ) : (
      //     <pre className="bg-gray-100 rounded p-2 my-1">
      //       <code {...props} />
      //     </pre>
      //   );
      // };
      // Render the AI response as Markdown
      const formattedResponse = (
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          components={{
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              h1: ({node, ...props}) => <h1 className="text-xl font-bold my-2" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              h2: ({node, ...props}) => <h2 className="text-lg font-semibold my-2" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              h3: ({node, ...props}) => <h3 className="text-md font-medium my-1" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              p: ({node, ...props}) => <p className="my-1" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              ul: ({node, ...props}) => <ul className="list-disc list-inside my-1" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              ol: ({node, ...props}) => <ol className="list-decimal list-inside my-1" {...props} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              // code: ({node, inline, ...props}) => 
              //   inline 
              //     ? <code className="bg-gray-200 rounded px-1" {...props} />
              //     : <pre className="bg-gray-100 rounded p-2 my-1"><code {...props} /></pre>
            }}
        >
          {aiResponse}
        </ReactMarkdown>
      );
      if (currentChatArticle) {
      setChatMessages({
        ...chatMessages,
        [currentChatArticle.id]: [
          ...updatedMessages,
          { role: 'ai', content: formattedResponse }
        ]
      })}
    } catch (error) {
      console.error("Error in chat:", error);
    }
  }

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible)
  }

  // Define the clearChat function
  const clearChat = () => {
    setChatMessages({});
    setChatInput("");
    console.log('Chat cleared');
  };

  return (
    <div className="min-h-screen bg-background text-xs">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* <header className="sticky top-0 z-50 w-full border-b bg-gradient-dark-black backdrop-blur"> */}
  
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a href='/'>
            <Image src="/logo.svg" alt="Logo" width={100} height={100} className="pl-4" />

            </a>
            <nav className="flex items-center space-x-6 text-xs font-medium">
            <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 top-3 right-4 "
            style={{zIndex:999}}
            onClick={() => toggleSidebar()}
          >
            {isSidebarVisible ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>


            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <main className={`${isSidebarVisible ? 'lg:w-2/3' : 'w-full'}`}>
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>


              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="AIML">AIML</SelectItem>
                  {/* <SelectItem value="AR-VR">AR-VR</SelectItem> */}
                  <SelectItem value="Block Chain">Block Chain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {newsArticles.map((article) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden h-full flex flex-col">
                      <div className="relative h-48">
                        <img src={article.image} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end p-4">
                          <Badge variant="secondary" className="mb-2">{article.label}</Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-sm">{article.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs">{article.brief}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between mt-auto">
                        <Button variant="outline" size="sm" onClick={() => openModal(article)}>Read More</Button>

                        <a 
                          href={(article.urls).toString()} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm hover:text-blue-500 transition-colors duration-300 flex items-center"
                        >
                          <span className="mr-2">{article?.author}</span>
                          
                        </a>
                        {article.isSaved ? (
                          <Button className="bg-gray-500 text-white" size="sm" onClick={() => removeFromCart(article)}>
                            <MinusCircle className="mr-2 h-3 w-3" /> Remove
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => addToCart(article)}>
                            <PlusCircle className="mr-2 h-3 w-3" /> Save
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <Button
                onClick={() => {
                  setPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <span>Page {page}</span>
              <Button
                onClick={() => {
                  setPage(p => p + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={newsArticles.length < 10 || isLoading}
              >
                Next
              </Button>
            </div>
          </main>

          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <aside className={`lg:fixed right-0 lg:w-1/3 ${isSidebarVisible ? 'block' : 'hidden lg:block'}`} style={{display: isSidebarVisible ? 'block' : 'none'}}>    
            <Card className="w-full bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 border border-gray-700 shadow-lg">
              <CardHeader className="bg-gray-800 bg-opacity-50">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <ShoppingCart className="mr-2 text-blue-400" />
                    Saved Articles
                  </span>
                  <Button variant="destructive" size="sm" onClick={clearCart} className="bg-red-500 hover:bg-red-600">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full rounded-md border border-gray-700 p-4">
                  <AnimatePresence>
                    {cart.map((article) => (
                      <motion.div 
                        key={article.id} 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }} 
                        transition={{ duration: 0.3 }}
                        className="mb-4 last:mb-0"
                      >
                        <div className="flex flex-col gap-2 py-2 border-b border-gray-700 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-blue-300">{article.title}</span>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-gray-700 text-blue-200">{article.label}</Badge>
                              <Button variant="ghost" size="sm" onClick={() => removeFromCart(article)} className="text-gray-400 hover:text-gray-200">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {summaries[article.id] && (
                            <div className="text-xs mt-2 text-gray-300">
                              <strong className="text-blue-300">Summary:</strong> {summaries[article.id]}
                            </div>
                          )}

                          {audioMessages[article.id] && (
                            <div className="text-xs mt-2 text-gray-300">
                              <strong className="text-blue-300">Audio:</strong>
                  
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleAudioPlayback(article.id.toString())}
                                className="ml-2 text-blue-400 hover:text-blue-300"
                              >
                                {playingAudio === article.id.toString() ? (
                                  <PauseCircle className="h-4 w-4" />
                                ) : (
                                  <PlayCircle className="h-4 w-4" />
                                )}

                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => downloadAudio(article.id.toString())} className="text-gray-400 hover:text-gray-200">
                                  <Download className="h-4 w-4" />
                                </Button>
                              {playingAudio === article.id.toString() && (
                                <audio
                                  autoPlay
                                  controls
                                  className="mt-1 w-full"
                                  onEnded={() => setPlayingAudio(null)}
                                >
                                  <source src={audioMessages[article.id]} type="audio/mpeg" />
                                  Your browser does not support the audio tag.
                                </audio>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {summaries.aggregate && (
                    <div className="mt-4 p-2 border border-gray-700 rounded-md bg-gray-800 bg-opacity-50">
                      <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        remarkPlugins={[remarkGfm]}
                        components ={ {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-blue-300 mb-2" {...props} />,
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          p: ({node, ...props}) => <p className="text-sm text-gray-300 mb-2" {...props} />,
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          strong: ({node, ...props}) => <strong className="text-blue-200" {...props} />,
                        }}
                        className="markdown-body text-gray-200"
                      >
                        {summaries.aggregate}
                      </ReactMarkdown>
                    </div>
                  )}
                </ScrollArea>

                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSummarize(cart.map((article) => article.id))}
                    className="bg-gray-700 bg-opacity-50 text-blue-300 hover:bg-gray-600 hover:text-blue-200 border-gray-600"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Summarize All
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConvertToAudio(cart.map((article) => article.id))}
                    className="bg-gray-700 bg-opacity-50 text-blue-300 hover:bg-gray-600 hover:text-blue-200 border-gray-600"
                  >
                    <Headphones className="mr-2 h-4 w-4" /> Convert All to Audio
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openChatModal(cart.map((article) => article.id))}
                    className="bg-gray-700 bg-opacity-50 text-blue-300 hover:bg-gray-600 hover:text-blue-200 border-gray-600"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> Chat About All
                  </Button>
                </div>
              </CardContent>     
            </Card>
            <Card className="mt-4 bg-black">
              <CardHeader>
                <CardTitle className="text-sm font-light text-white ">AI/ML Technology Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[120px] w-full rounded-md p-4">
                  <div className="flex flex-wrap gap-3">
                    {[
                      "AIML",
                      "AR-VR",
                      "BLOCKCHAIN",

                    ].map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="cursor-pointer bg-transparent hover:bg-primary/10 transition-colors text-white duration-300 text-xs font-light"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>


        </div>
       
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {selectedArticle && (
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-gray-900 text-gray-100">
            <DialogHeader className="border-b border-gray-700 pb-4">
              <DialogTitle className="text-2xl font-semibold text-gray-100">
                {selectedArticle.title}
              </DialogTitle>
              <DialogDescription className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">{selectedArticle.label}</Badge>

              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-grow">
              <div className="space-y-6 p-6">
                <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-64 object-cover rounded-lg shadow-md" />
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-base leading-relaxed text-gray-300">{selectedArticle.content}</p>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-4 px-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-100">Additional Information</h3>
                <p className="text-sm text-gray-500">
                Author:- 
                    <span className='text-gray-200'>
                        {selectedArticle.author || 'Anonymous'}
                    </span>
                  </p>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-500">Explore Further:</p>
                  {selectedArticle.urls? (

                        <a 
                          href={(selectedArticle.urls).toString()} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-300 flex items-center"
                        >
                          <span className="mr-2">🔗{selectedArticle.title}</span>
                          
                        </a>
                        
                      
                    
                  ) : (
                    <li className="text-sm text-gray-500 italic">No additional resources available.</li>
                  )}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="border-t border-gray-700 pt-4 mt-auto">
              <Button onClick={closeModal} className="bg-blue-600 hover:bg-blue-700 text-gray-100 font-medium transition-all duration-300">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <ChatDialog 
        isChatModalOpen={isChatModalOpen}
        setIsChatModalOpen={setIsChatModalOpen}
        currentChatArticle={currentChatArticle}
        chatMessages={chatMessages}
        chatEndRef={chatEndRef}
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleChatSubmit={handleChatSubmit}
        clearChat={clearChat}
      />
    </div>
  )
}


// Make sure ChatDialog is properly imported and exported in its file
