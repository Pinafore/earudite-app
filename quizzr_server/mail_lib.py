import os
import time
import errno
import smtplib
import mimetypes
from email import utils as eutils
from email.message import EmailMessage


class Mailer:
    def __init__(self, logger, sender, host='localhost', port=25, sender_spec=None, retries=3):
        self.logger = logger
        self.sender      = sender
        self.retries     = retries
        self.mailhost    = host
        self.mailport    = port
        self.sender_spec = sender_spec
        self.next_sender = 0 if sender_spec is not None else -1

    def disconnect(self, sleep=1):
        try:
            self.connection.quit()
        except smtplib.SMTPServerDisconnected:
            pass
        except Exception as e:
            self.logger.error('Exception {} while performing smtplib.quit()'.format(e))

        if sleep > 0:
            time.sleep(sleep)

    def sendMail(self, to=None, cc=None, bcc=None, subject=None, htmlbody=None, textbody=None, attachments=None):
        message = EmailMessage()
        if textbody is not None:
            message.set_content(textbody)

        if htmlbody is not None:
            message.add_alternative(htmlbody, subtype='html')

        message['Subject'] = subject
        message['From']    = eutils.formataddr(self.sender)

        recips = []
        if to is not None:
            if type(to) is list:
                message['To'] = ', '.join([eutils.formataddr(addr) for addr in to])
                recips += [ addr[1] for addr in to ]
            elif type(to) is tuple:
                message['To'] = eutils.formataddr(to)
                recips.append(to[1])
            else:
                message['To'] = to
                recips.append(to)

        if cc is not None:
            if type(cc) is list:
                message['Cc'] = ', '.join([eutils.formataddr(addr) for addr in cc])
                recips += [ addr[1] for addr in cc ]
            else:
                message['Cc'] = eutils.formataddr(cc)
                recips.append(cc[1])

        if bcc is not None:
            # bcc addressees do not belong in message['Bcc'] or they will appear in the e-mail
            # The recips list contains all of the addressees, which is passed to send_message as an argument
            if type(bcc) is list:
                recips += [ addr[1] for addr in bcc ]
            else:
                recips.append(bcc[1])

        if attachments is not None:
            if type(attachments) is str:
                attachments = [ attachments ]

            for attachment in attachments:
                if not os.path.isfile(attachment):
                    raise FileNotFoundError(errno.ENOENT, os.strerror(errno.ENOENT), attachment)

                content_type, encoding = mimetypes.guess_type(attachment)
                if content_type is None or encoding is not None:
                    content_type = 'application/octet-stream'
                maintype, subtype = content_type.split('/', 1)
                with open(attachment, 'rb') as fp:
                    message.add_attachment(fp.read(),
                                           maintype=maintype,
                                           subtype=subtype,
                                           filename=os.path.basename(attachment))

        try:
            self.connection = smtplib.SMTP(host=self.mailhost, port=self.mailport)
        except Exception as e:
            self.logger.error('Exception {} while instantiating SMTP object'.format(e))
            self.disconnect()
            return

        try:
            self.connection.ehlo_or_helo_if_needed()
        except Exception as e:
            self.logger.error('Exception {} while calling SMTP.ehlo_or_helo_if_needed()'.format(e))
            self.disconnect()
            return

        if self.connection.has_extn('STARTTLS'):
            self.connection.starttls()
            try:
                self.connection.ehlo_or_helo_if_needed()    # This must be called again after SMTP.starttls()
            except Exception as e:
                self.logger.error('Exception {} while calling SMTP.ehlo_or_helo_if_needed()'.format(e))
                self.disconnect()
                return

        if self.next_sender != -1:
            auth_user   = self.sender_spec[self.next_sender]['user']
            auth_passwd = self.sender_spec[self.next_sender]['pass']
            try:
                self.connection.login(auth_user, auth_passwd)
            except smtplib.SMTPHeloError:
                self.logger.error('SMTP server did not reply properly to HELO greeting')
                self.disconnect()
                raise
            except smtplib.SMTPAuthenticationError:
                self.logger.error('SMTP server did not accept the username/password combination')
                self.disconnect()
                raise
            except smtplib.SMTPNotSupportedError:
                self.logger.error('The AUTH command is not support by the SMTP server')
                self.disconnect()
                raise
            except smtplib.SMTPException:
                self.logger.error('No suitable authentication method was found for the SMTP server')
                self.disconnect()
                raise
            except Exception as e:
                self.logger.error('Unexpected exception {} while calling SMTP.login()'.format(e))
                self.disconnect()
                raise

        try:
            self.connection.send_message(message, self.sender[1], recips)
        except Exception as e:
            self.logger.error('Exception {} while calling SMTP.send_message'.format(e))
            self.disconnect()
            raise
        else:
            self.disconnect(0)
            if self.sender_spec is not None:
                self.next_sender = self.next_sender + 1 if self.next_sender + 1 < len(self.sender_spec) else 0