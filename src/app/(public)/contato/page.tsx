"use client";

import { useState } from "react";
import { Mail, MessageSquare, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";

export default function ContatoPage() {
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", assunto: "", mensagem: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    await new Promise((r) => setTimeout(r, 1000));
    setCarregando(false);
    setEnviado(true);
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">Fale conosco</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Nossa equipe está pronta para ajudar. Envie sua mensagem e retornaremos em até 1 dia útil.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informações de contato */}
        <div className="space-y-4">
          <Card>
            <CardBody className="p-5 flex items-start gap-4">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg shrink-0">
                <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">E-mail</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">contato@alugaja.com.br</p>
                <p className="text-xs text-slate-400 mt-0.5">Resposta em até 1 dia útil</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5 flex items-start gap-4">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg shrink-0">
                <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Chat no app</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Disponível para usuários cadastrados</p>
                <p className="text-xs text-slate-400 mt-0.5">Seg–Sex, 9h às 18h</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5 flex items-start gap-4">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg shrink-0">
                <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">WhatsApp</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">(11) 91234-5678</p>
                <p className="text-xs text-slate-400 mt-0.5">Seg–Sex, 9h às 18h</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5 flex items-start gap-4">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg shrink-0">
                <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Sede</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">São Paulo – SP, Brasil</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Formulário */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="p-6 sm:p-8">
              {enviado ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Mensagem enviada!</h2>
                  <p className="text-slate-500 dark:text-slate-400">Retornaremos para <strong>{form.email}</strong> em até 1 dia útil.</p>
                  <Button className="mt-6" variante="outline" onClick={() => { setEnviado(false); setForm({ nome: "", email: "", assunto: "", mensagem: "" }); }}>
                    Enviar outra mensagem
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Seu nome"
                      placeholder="João Silva"
                      required
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    />
                    <Input
                      label="Seu e-mail"
                      type="email"
                      placeholder="joao@email.com"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Assunto
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                      value={form.assunto}
                      onChange={(e) => setForm({ ...form, assunto: e.target.value })}
                    >
                      <option value="">Selecione um assunto</option>
                      <option>Dúvida sobre anúncio</option>
                      <option>Problema com pagamento</option>
                      <option>Contrato digital</option>
                      <option>Reportar golpe ou fraude</option>
                      <option>Cancelamento / exclusão de conta</option>
                      <option>AlugaJá Pro</option>
                      <option>Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Mensagem
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Descreva sua dúvida ou problema em detalhes..."
                      required
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      value={form.mensagem}
                      onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full" tamanho="lg" carregando={carregando}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar mensagem
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
