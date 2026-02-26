
"use client";

import { Header } from '@/components/TubeBatch/Header';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, MessageCircle, ShieldQuestion, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SupportPage() {
  const { toast } = useToast();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We've received your request and will get back to you within 24 hours.",
    });
    (e.target as HTMLFormElement).reset();
  };

  const faqs = [
    {
      question: "Which platforms are supported?",
      answer: "Currently, TubeBatch is optimized for YouTube videos. We are working on adding support for Vimeo and other major platforms in the near future."
    },
    {
      question: "Is there a limit on batch size?",
      answer: "For performance reasons, we recommend batches of up to 100 videos at a time. The browser's memory handles the processing, so larger batches may slow down your machine."
    },
    {
      question: "What video quality is downloaded?",
      answer: "The downloader attempts to grab the highest available resolution for each stream up to 1080p. 4K support is currently in beta."
    },
    {
      question: "How do I fix 'Stream connection lost' errors?",
      answer: "This is usually caused by temporary network interruptions. Simply click the refresh icon next to the failed item to retry that specific download."
    }
  ];

  return (
    <main className="min-h-screen pb-20">
      <Header />
      
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Support Center</h2>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions or reach out to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <ShieldQuestion className="w-6 h-6 text-accent" />
              Frequently Asked Questions
            </h3>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`} className="glass-card border-none px-6 rounded-xl">
                  <AccordionTrigger className="hover:no-underline font-semibold py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="lg:col-span-1">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-accent" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What can we help with?" required className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Describe your issue in detail..." className="min-h-[120px] bg-background/50" required />
                  </div>
                  <Button type="submit" className="w-full bg-accent text-background hover:bg-accent/90">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-border/40">
                  <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest text-muted-foreground">Direct Help</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-lg bg-primary/20 text-accent">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">Live Chat</p>
                        <p className="text-xs text-muted-foreground">Available Mon-Fri, 9am-5pm EST</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
